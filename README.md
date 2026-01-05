```markdown
# 🎨 Real-Time Jamboard Pro

A high-performance, infinite-canvas collaborative whiteboard built with **Node.js**, **Socket.io**, and **Fabric.js**. 

Features real-time object synchronization, live cursors, and persistent storage via MongoDB. Designed to mimic professional tools like Miro or Google Jamboard.


## 🚀 Features

* **⚡ Real-Time Collaboration:** See drawings, moves, and edits from other users instantly (WebSockets).
* **♾️ Infinite Canvas:** Zoom in/out and pan around an unlimited workspace.
* **🖌️ Vector Engine:** Powered by Fabric.js. Move, resize, and rotate sticky notes, text, and shapes after drawing them.
* **👥 Live Presence:** See named cursors of other users moving in real-time.
* **💾 Smart Persistence:** Debounced auto-save to MongoDB ensures data is safe without overloading the database.
* **📑 Multi-Slide Support:** Create and navigate through multiple board pages.
* **🎨 Modern UI:** Glassmorphism design with a clean, tool-focused interface.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Glassmorphism), Fabric.js (Canvas Engine)
* **Backend:** Node.js, Express
* **Real-Time:** Socket.io
* **Database:** MongoDB (Mongoose)

## 📦 Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone [https://github.com/Vedantrip/RealTime_Jamboard.git](https://github.com/Vedantrip/RealTime_Jamboard.git)
cd RealTime_Jamboard

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Setup

Create a `.env` file in the root directory to store your database credentials.

```bash
touch .env

```

Add your MongoDB connection string inside the `.env` file:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jamboardDB
PORT=3000

```

### 4. Run the Server

```bash
node server.js

```

Open your browser and navigate to `http://localhost:3000`.

## 🎮 How to Use

1. **Join a Room:** Enter a unique Room Name (e.g., "DesignTeam") and your User Name.
2. **Tools:**
* **Select (V):** Click to select objects. Drag to move. Use handles to resize/rotate.
* **Pan (Alt + Drag):** Hold `Alt` and drag the mouse to move around the infinite canvas.
* **Zoom:** Use your mouse wheel to zoom in and out.


3. **Share:** Send the Room Name to a friend to collaborate instantly.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License].
