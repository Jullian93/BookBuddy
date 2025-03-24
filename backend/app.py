from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/books')
def get_books():
    books = [
        {"id": 1, "title": "The Lightning Thief", "author": "Rick Riordan"},
        {"id": 2, "title": "Wonder", "author": "R.J. Palacio"},
        {"id": 3, "title": "Diary of a Wimpy Kid", "author": "Jeff Kinney"}
    ]
    return jsonify(books)

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
