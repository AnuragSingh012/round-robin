# 🏷️ Round-Robin Coupon Distribution with Abuse Prevention

## 📌 Overview
This web application distributes coupons to guest users in a **round-robin manner** while incorporating **abuse prevention mechanisms** to prevent users from exploiting page refreshes to claim multiple coupons within a restricted time frame.

## 🚀 Features
- **Round-Robin Coupon Distribution:** Ensures fair coupon assignment by distributing them sequentially.
- **Guest Access:** Users can claim coupons without needing an account or login.
- **Abuse Prevention Mechanisms:**
  - **IP Tracking:** Prevents multiple claims from the same IP within a specified time frame.
  - **Cookie Tracking:** Detects multiple claims from the same browser session.
  - **Rate Limiting:** Restricts rapid repeated requests to prevent spam.
- **User Feedback:** Provides clear messages indicating claim success or cooldown time.

---

## 🛠️ Setup Instructions

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/AnuragSingh012/round-robin.git
cd round-robin
```

### **2️⃣ Install Dependencies and Start the Application**
```sh
npm install
npm run dev
```
