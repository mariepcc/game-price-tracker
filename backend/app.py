import subprocess
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from flask_cors import CORS
from api.main import run_main

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///database.db'

db = SQLAlchemy(app)

class GameResult(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    game_id = db.Column(db.String(255), unique=True)
    title = db.Column(db.String(255))
    description = db.Column(db.String(1000))
    image = db.Column(db.String(1000))
    price = db.Column(db.Float)
    shop = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    search_text = db.Column(db.String(255))

    
    def __init__(self, game_id, title, description, image, price, shop, search_text):
        self.game_id = game_id
        self.title = title
        self.description = description
        self.image = image
        self.price = price
        self.shop = shop
        self.search_text = search_text


class TrackedGames(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(1000))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    tracked = db.Column(db.Boolean, default=True)

    def __init__(self, name, tracked=True):
        self.name = name
        self.tracked = tracked

@app.route('/results', methods=['POST'])
def submit_results():
    result = request.json.get('data')
    search_text = request.json.get("search_text")
    print(result)


    game_result = GameResult(
        game_id=result["game_id"],
        title=result["title"],
        description=result["description"],
        image=result["image"],
        price=result["current_price"],
        shop=result["shop"],
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
        game_id = result.game_id
        if game_id not in game_dict:
            game_dict[game_id] = {
                'game_id': result.game_id,
                'title': result.title,
                'description': result.description,
                'image': result.image,
                "shop": result.shop,
                "created_at": result.created_at,
                'priceHistory': []
            }
        game_dict[game_id]['priceHistory'].append({
            'price': result.price,
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
            "game_id": result.game_id,
            "title": result.title,
            'description': result.description,
            'image': result.image,
            "price": result.price,
            "shop": result.shop,
            "created_at": result.created_at,
            "search_text": result.search_text,
        })

    return jsonify(game_results)

@app.route('/get-game', methods=['POST'])
def get_game_info():
    search_text = request.json.get('search_text')
    
    if not search_text:
        return jsonify({"error": "Missing search_text"}), 400
    run_main(search_text)

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


@app.route('/tracked-game/<int:game_id>', methods=['PUT'])
def toggle_tracked_game(game_id):
    tracked_game = TrackedGames.query.get(game_id)
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
            'description': game.description,
            'image': game.image,
            'created_at': game.created_at,
            'tracked': game.tracked
        })

    return jsonify(results), 200


@app.route("/update-tracked-games", methods=["POST"])
def update_tracked_games():
    tracked_games = TrackedGames.query.all()

    game_names = []
    for tracked_game in tracked_games:
        name = tracked_game.name
        if not tracked_game.tracked:
            continue

        run_main(name)
        game_names.append(name)

    response = {'message': 'Api request started successfully',
                "games": game_names}
    return jsonify(response), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)