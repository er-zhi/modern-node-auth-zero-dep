# **Modern Node.js Auth – Zero Dependencies 🚀**

## **Disclaimer**

This project demonstrates **authentication in pure Node.js** without external dependencies.\
It is a **proof of concept**, not necessarily optimized for production.\
The goal is to explore **modern Node.js capabilities**, JWT handling, and SOLID principles **without relying on frameworks**.

---

## **🔥 Why This Project?**

If you're **tired of dependency hell** and want a **modern, minimalistic authentication system** without external packages, this repo is for you!

🇷 **No frameworks**\
🇷 **No external libraries**\
🇷 **Just pure Node.js magic** ✨

---

## **🚀 Features**

👉 **Built with Node.js v23** – No Express, no libraries, just the built-in `http` module.\
👉 **JWT authentication** using **Node.js crypto** – No third-party JWT packages.\
👉 **Fast testing with only bullet-in libraries** using **Node.js test and assert** – Goodbye Jest, Chai, Mocha!\
👉 **SQLite** (without external drivers) for **persistent storage**.\
👉 **Fake-Redis** (implemented in SQLite) for **caching**.\
👉 **TypeScript** for type safety and maintainability.\
👉 **Minimal & fast** – Uses only **core Node.js modules**.

---

## **📌 API Endpoints**

| Method      | Endpoint   | Description                      |
| ----------- | ---------- | -------------------------------- |
| 🔹 **POST** | `/signup`  | Register a new user              |
| 🔹 **POST** | `/login`   | Authenticate and receive a token |
| 🔹 **POST** | `/logout`  | Invalidate the session           |
| 🔹 **POST** | `/refresh` | Refresh JWT token                |
| 🔹 **POST**  | `/profile` | Fetch user details               |

Everything runs **without a single NPM package**. Just **pure Node.js.** 💡

---

## **🛠️ Installation**

### **1⃣ Clone the Repository**

```sh
git clone https://github.com/er-zhi/modern-node-auth-zero-dep.git
cd modern-node-auth-zero-dep
```

### **2⃣ Set Up Environment Variables**

Create a `.env` file in the root directory and configure it:

```sh
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000
```

---

## **🚀 Running the Project**

### **Start the Server**

```sh
npm start
```

or in **watch mode** for development:

```sh
npm run dev
```

---

## **🤦‍♂️ Running Tests**

### **Unit Tests**

```sh
npm test
```

👉 **Unit tests are written with `node:test`**\
👉 **Mocking done using interfaces (SOLID)**

### **End-to-End (E2E) Tests**

```sh
npm run test:e2e
```

👉 **E2E tests simulate real-world API calls**\
👉 **Use of in-memory SQLite and Fake-Redis for testing**

---

### 🎉 **Enjoy hacking with vanilla Node.js!** 🎯

