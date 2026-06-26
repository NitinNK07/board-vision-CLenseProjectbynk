# CLens Chess PGN Scanner - Network Setup Guide

## Setting up LAN Connection (Mobile App to Backend)

To connect your mobile app to the backend server over Wi-Fi, follow these steps:

### 1. Find Your Laptop's IP Address

**On Windows:**
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for your Wi-Fi adapter's IPv4 address (usually starts with 192.168.x.x or 10.x.x.x)

**On macOS/Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your Wi-Fi adapter's IP address (usually starts with 192.168.x.x or 10.x.x.x)

### 2. Update the Mobile App Configuration

In `services/api.js`, update the DEV_SERVER variable:

```javascript
const DEV_SERVER = "http://YOUR_IP_ADDRESS:8081"; // Replace YOUR_IP_ADDRESS with your laptop's IP
```

Example: If your IP is 192.168.1.100, use:
```javascript
const DEV_SERVER = "http://192.168.1.100:8081";
```

### 3. Test the Connection

1. Make sure both your mobile device and laptop are on the same Wi-Fi network
2. Start your Spring Boot backend: `mvn spring-boot:run`
3. Open the network test screen in your app: `/network-test`
4. Click "Test Connection" to verify connectivity

### 4. Common Issues & Solutions

**Issue:** Connection timeout
- Solution: Verify both devices are on the same network
- Solution: Check firewall settings on your laptop

**Issue:** Network error
- Solution: Verify the IP address is correct
- Solution: Check that the backend server is running on port 8081

**Issue:** CORS error
- Solution: Backend should allow requests from mobile devices (already configured)

### 5. Running the Backend

Make sure your Spring Boot backend is running:

```bash
cd pgn-backend
mvn spring-boot:run
```

The backend should be accessible at `http://YOUR_IP:8081`

### 6. Testing

1. Open the network test screen in your app
2. Tap "Test Connection" to verify the mobile app can reach the backend
3. Once connected, you can use the login/signup functionality

This setup allows your mobile app to connect directly to your development server over the local network, avoiding the need for Expo tunnels which can be unstable.