from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory list of users
users = [
    {"id": 1, "username": "bill", "password": "12"},
    {"id": 2, "username": "bob",  "password": "my12"}
]

#testing with simple get
@app.route('/login', methods=['GET'])
def login_get():
    return "Hello from GET /login"

# POST /login
@app.route('/login', methods=['POST'])
def login_post():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = next((u for u in users if u["username"] == username and u["password"] == password), None)

    if user:
        return jsonify({
            "success": True,
            "message": "Login successful",
            "userId": user["id"],
            "token": "fake-jwt-token-123"
        })
    else:
        return jsonify({
            "success": False,
            "message": "Invalid username or password"
        }), 401

if __name__ == '__main__':
    app.run(port=3000)
