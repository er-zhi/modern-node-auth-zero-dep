## Disclaimer: I just want to demonstrate what can be achieved with vanilla Node.js. This isn't necessarily the best approach—it's more of a proof of concept. The code could be better structured and written, but my goal isn't to reinvent the wheel or build my own framework. This is purely a practice exercise in working with JWT.


**Modern Node.js Auth – Zero Dependencies 🚀**

If you're **tired of dependency hell** and want a **modern, minimalistic** Node.js authentication system without external packages, this repo is for you!

### **🔥 Features**
✅ Built with **Node.js v23** – no frameworks, no libraries, just pure JS  
✅ **JWT authentication** using only built-in `crypto`  
✅ **SQLite (without external drivers)** for persistent storage
✅ **Fake-Redis (SQLite based and it's super fast)** for cashing
✅ **TypeScript** for type safety  
✅ **Minimal & fast** – runs on the built-in `http` module

### **📌 Endpoints**
🔹 `POST /signin` – Create an account  
🔹 `POST /login` – Authenticate and get a token  
🔹 `POST /logout` – Invalidate the session  
🔹 `POST /refresh` – Refresh JWT token  
🔹 `POST /profile` – Fetch user details

No bloated dependencies. Just **pure Node.js magic**. ✨

📖 **[Read the article]()** for a step-by-step guide! 🚀
