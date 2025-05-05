import subprocess
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from zoneinfo import ZoneInfo
from flask_cors import CORS
from flask_mail import Mail, Message
from api.main import main as update_price_main

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///database.db'
app.config['MAIL_SERVER']="smtp.gmail.com"
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = "maria.pacocha358@gmail.com"
app.config['MAIL_PASSWORD'] = "jAffos-fovfi8-hokqom"
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

db = SQLAlchemy(app)

class GameResult(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(255))
    description = db.Column(db.String(1000))
    image = db.Column(db.String(1000))
    screenshot = db.Column(db.String(1000))
    current_price = db.Column(db.Float)
    regular_price = db.Column(db.Float)
    url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now(ZoneInfo("Europe/Warsaw")))
    search_text = db.Column(db.String(255))

    
    def __init__(self, title, description, image, screenshot, current_price, regular_price, url, search_text):
        self.title = title
        self.description = description
        self.image = image
        self.screenshot = screenshot
        self.current_price = current_price
        self.regular_price = regular_price
        self.url = url
        self.search_text = search_text


class TrackedGames(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(1000))
    created_at = db.Column(db.DateTime, default=datetime.now(ZoneInfo("Europe/Warsaw")))
    tracked = db.Column(db.Boolean, default=True)

    def __init__(self, name, tracked=True):
        self.name = name
        self.tracked = tracked

@app.route('/results', methods=['POST'])
def submit_results():
    result = request.json.get('data')
    search_text = request.json.get("search_text")

    game_result = GameResult(
    title=result["title"],
    description=result["description"],
    image=result["image"],
    screenshot=result["screenshot"],
    current_price=result["current_price"],
    regular_price=result["regular_price"],
    url=result["ps_store_url"],
    search_text=search_text,
    )

    db.session.add(game_result)

    db.session.commit()
    response = {'message': 'Received data successfully'}
    return jsonify(response), 200

@app.route('/unique_search_texts', methods=['GET'])
def get_unique_search_texts():
    unique_search_texts = db.session.query(
        GameResult.search_text).distinct().all()
    unique_search_texts = [text[0] for text in unique_search_texts]
    return jsonify(unique_search_texts)


@app.route('/results')
def get_games_results():
    search_text = request.args.get('search_text')
    results = GameResult.query.filter_by(search_text=search_text).order_by(
        GameResult.created_at.desc()).all()

    game_dict = {}
    for result in results:
        url = result.url
        if url not in game_dict:
            game_dict[url] = {
                'title': result.title,
                'description': result.description,
                'image': result.image,
                'screenshot': result.screenshot,
                'created_at': result.created_at,
                'regular_price': result.regular_price,
                'url' : result.url,
                'priceHistory': []
            }
        game_dict[url]['priceHistory'].append({
            'price': result.current_price,
            'date': result.created_at
        })

    formatted_results = list(game_dict.values())

    return jsonify(formatted_results)

@app.route('/all-results', methods=['GET'])
def get_results():
    results = GameResult.query.all()
    game_results = []
    for result in results:
        game_results.append({
            'title': result.title,
            'description': result.description,
            'image': result.image,
            'screenshot': result.screenshot,
            'current_price': result.current_price,
            'regular_price': result.regular_price,
            'url': result.url,
            'created_at': result.created_at,
            'search_text': result.search_text,
        })

    return jsonify(game_results)

@app.route('/get-game', methods=['POST'])
def get_game_info():
    search_text = request.json.get('search_text')
    
    if not search_text:
        return jsonify({"error": "Missing search_text"}), 400
    
    update_price_main(search_text, "/results")

    response = {'message': 'Game search started successfully'}
    return jsonify(response), 200

@app.route('/add-tracked-game', methods=['POST'])
def add_tracked_game():
    name = request.json.get('name')
    tracked_game = TrackedGames(name=name)
    db.session.add(tracked_game)
    db.session.commit()

    response = {'message': 'Tracked game added successfully',
                'id': tracked_game.id}
    return jsonify(response), 200

@app.route('/remove-game', methods=['POST'])
def remove_game():
    name = request.args.get('name')
    
    games = GameResult.query.filter_by(search_text=name).all()
    
    if games:
        for game in games:
            db.session.delete(game)
            db.session.commit()
            return jsonify({'message': 'Game removed successfully', 'id': game.id}), 200
    else:
        return jsonify({'error': 'Game not found'}), 404


@app.route('/tracked-game/<int:url>', methods=['PUT'])
def toggle_tracked_game(url):
    tracked_game = TrackedGames.query.get(url)
    if tracked_game is None:
        response = {'message': 'Tracked game not found'}
        return jsonify(response), 404

    tracked_game.tracked = not tracked_game.tracked
    db.session.commit()

    response = {'message': 'Tracked game toggled successfully'}
    return jsonify(response), 200


@app.route('/tracked-games', methods=['GET'])
def get_tracked_games():
    tracked_games = TrackedGames.query.all()

    results = []
    for game in tracked_games:
        results.append({
            'id': game.id,
            'title': game.name,
            'created_at': game.created_at,
            'tracked': game.tracked
        })

    return jsonify(results), 200


@app.route("/update-tracked-games", methods=["POST"])
def update_tracked_games():
    tracked_games = TrackedGames.query.all()

    game_names = []
    for tracked_game in tracked_games:
        print(f"Checking: {tracked_game.name} (tracked={tracked_game.tracked})")

        name = tracked_game.name
        if not tracked_game.tracked:
            continue

        update_price_main(name, "/results")

        #if price_dropped(tracked_game):
            #send_email(tracked_game)

        game_names.append(name)

    response = {'message': 'Tracked games updated successfully',
                "games": game_names}
    return jsonify(response), 200

def price_dropped(game_result):
    price_history = GameResult.query.get(game_result.name).priceHistory
    if len(price_history) < 2:
        return False
    
    current_price = price_history[-1]['current_price']
    previous_price = price_history[-2]['current_price']
    
    return current_price < previous_price

@app.route("/send_mail")
def send_email(game):
    name = game.name
    price = request.json.get('price')
    mail_message = Message(f'Great news! {name} is on discount!',
            sender =   'maria.pacocha358@gmail.com',
            recipients = ['maria.jalocha358@gmail.com'])
    mail_message.body = f'🎮 Great news! The price of {name} in PS Store just dropped to {price} zł and it is currently on discount! Do not miss the deal ;).', 
            
    mail.send(mail_message)
    return "Mail has been sent"



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)