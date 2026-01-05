require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors'); // Recommended

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server);

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

// Use "minimize: false" to ensure empty objects {} are saved
const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  currentSlide: { type: Number, default: 1 },
  slides: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { minimize: false, strict: false }); 

const Room = mongoose.model('Room', RoomSchema);
const roomData = {};

app.get('/check/:room', async (req, res) => {
  try {
    const doc = await Room.findOne({ name: req.params.room }).lean();
    res.json(doc || { error: "Room not found in DB" });
  } catch(e) { res.json({ error: e.message }); }
});

// --- DEBOUNCED SAVE ---
let saveTimers = {};
function triggerSave(roomName) {
  if (saveTimers[roomName]) clearTimeout(saveTimers[roomName]);
  
  saveTimers[roomName] = setTimeout(async () => {
    if (!roomData[roomName]) return;
    try {
      // 1. Force the slides to be a plain JS object to avoid Mongoose weirdness
      const plainSlides = JSON.parse(JSON.stringify(roomData[roomName].slides));
      
      console.log(`💾 Saving ${roomName} (Slide 1 has ${plainSlides['1']?.length || 0} items)...`);
      
      await Room.findOneAndUpdate(
        { name: roomName },
        { 
          $set: { 
            currentSlide: roomData[roomName].currentSlide,
            slides: plainSlides
          }
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Saved to DB!`);
    } catch (err) {
      console.error("❌ Save Failed:", err);
    }
  }, 1000); // 1 second debounce
}

io.on('connection', (socket) => {
  
  socket.on('join_room', async (room) => {
    socket.join(room);
    
    // 1. Fetch from RAM or DB
    if (!roomData[room]) {
      console.log(`🔍 Loading room "${room}" from DB...`);
      try {
        // .lean() gets a plain JSON object (Critical fix)
        let doc = await Room.findOne({ name: room }).lean();
        
        if (!doc) {
          console.log("✨ Creating new room in RAM");
          roomData[room] = { currentSlide: 1, slides: { 1: [] } };
        } else {
          console.log(`📂 Found DB Data: Slide 1 has ${doc.slides['1']?.length || 0} items`);
          roomData[room] = {
            currentSlide: doc.currentSlide,
            slides: doc.slides || { 1: [] }
          };
        }
      } catch (err) {
        console.error("DB Load Error:", err);
        roomData[room] = { currentSlide: 1, slides: { 1: [] } };
      }
    }

    // 2. Send Data
    const currentSlide = roomData[room].currentSlide;
    // Ensure array exists
    if (!roomData[room].slides[currentSlide]) roomData[room].slides[currentSlide] = [];
    
    const history = roomData[room].slides[currentSlide];
    socket.emit('load_slide', { slide: currentSlide, history: history });
  });

  // --- OBJECT SYNC ---
  socket.on('object:add', (data) => {
    socket.to(data.room).emit('object:add', data);
    
    if (roomData[data.room]) {
      if (!roomData[data.room].slides[data.slide]) roomData[data.room].slides[data.slide] = [];
      
      // Add object
      roomData[data.room].slides[data.slide].push(data.data);
      triggerSave(data.room);
    }
  });

  socket.on('object:update', (data) => {
    socket.to(data.room).emit('object:update', data);
    if (roomData[data.room]) {
      const slide = roomData[data.room].slides[data.slide];
      if (slide) {
        const idx = slide.findIndex(o => o.id === data.id);
        if (idx !== -1) {
          slide[idx] = { ...slide[idx], ...data.data }; // Merge updates
          triggerSave(data.room);
        }
      }
    }
  });

  socket.on('object:remove', (data) => {
    socket.to(data.room).emit('object:remove', data);
    if (roomData[data.room]) {
      const slide = roomData[data.room].slides[data.slide];
      if (slide) {
        roomData[data.room].slides[data.slide] = slide.filter(o => o.id !== data.id);
        triggerSave(data.room);
      }
    }
  });

  socket.on('change_slide', (data) => {
    const { room, slide } = data;
    if (roomData[room]) {
      roomData[room].currentSlide = slide;
      if (!roomData[room].slides[slide]) roomData[room].slides[slide] = [];
      const history = roomData[room].slides[slide];
      io.in(room).emit('load_slide', { slide, history });
      triggerSave(room);
    }
  });

  socket.on('clear_board', (data) => {
    io.in(data.room).emit('clear_board');
    if (roomData[data.room]) {
      roomData[data.room].slides[data.slide] = [];
      triggerSave(data.room);
    }
  });

  socket.on('cursor_move', (d) => socket.to(d.room).emit('cursor_update', d));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));