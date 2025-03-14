import json
import os
import re
import unicodedata
from requests import post
import requests

API_KEY = "887af83d2bfe0d0cd2043aada1c272476ae8c2ce"
API_KEY_RAWG = "12d9cf8f35cf4fe7a4a4b2275d7b9863"

url_info = "https://api.rawg.io/api/games/anno-1800?key="
url_photo = "https://api.rawg.io/api/games/anno-1800/screenshots?key="

def get_search_all(name):
    url = f"https://api.isthereanydeal.com/games/search/v1?key={API_KEY}&title={name}"


def string_to_slug(title):
    title = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("utf-8")
    title = re.sub(r"[^\w\s-]", "", title).strip().lower()
    slug = re.sub(r"[-\s]+", "-", title)
    return slug

def get_game_id(game_name):
    slug = string_to_slug(game_name)
    url = f"https://api.isthereanydeal.com/games/lookup/v1?key={API_KEY}&title={slug}"
    response = requests.get(url)
    data = response.json()

    if data:
        game_id = data['game']['id']
        return game_id
    return None

def get_game_description(name):
    slug = string_to_slug(name)
    rawgResponse = requests.get(f"https://api.rawg.io/api/games/{slug}?key={API_KEY_RAWG}")
    data = rawgResponse.json()
    return data.get("description", "No description available.")

def get_game_image(name):
    slug = string_to_slug(name)
    rawgResponse = requests.get(f"https://api.rawg.io/api/games/{slug}/screenshots?key={API_KEY_RAWG}")
    data = rawgResponse.json()
    if "results" in data and data["results"]:
        return data["results"][0].get("image", "No image available.")
    return "No screenshots available."


def get_game(name):
    url = f"https://api.isthereanydeal.com/games/overview/v2?key={API_KEY}"
    game_id = get_game_id(name)
    if not game_id:
        print(f"Game '{name}' not found.")
        return None
    data = [game_id]
    params = {
        "country": "PL" 
    }
    response = requests.post(url, json=data, params=params)
    data = response.json()
    prices = data.get("prices", [])
    if not prices:
        print(f"No price data available for '{name}'.")
        return None
    current_price = prices[0]["current"]["price"]["amount"]
    regular_price = prices[0]["current"]["regular"]["amount"]
    currency = prices[0]["current"]["price"]["currency"] 
    shop = prices[0]["current"]["shop"]["name"]
    description = get_game_description(name)
    image = get_game_image(name)
    
    return {"title": name,"game_id": game_id, "current_price": current_price, "currency": currency, 
    "regular_price": regular_price, "shop": shop, "description": description, "image": image}

def save_results(results):
    data = {"results": results}
    FILE = os.path.join("API", "results.json")
    with open(FILE, "w") as f:
        json.dump(data, f)


def post_results(results, search_text, endpoint):
    headers = {
        "Content-Type": "application/json"
    }
    data = {"data": results, "search_text": search_text}

    print("Sending request to", endpoint)
    response = post("http://127.0.0.1:5000" + endpoint,
                    headers=headers, json=data)
    print("Status code:", response.status_code)

def run_main(search_text, response_route="/results"):
    results = get_game(search_text)
    if not results:
        print(f"No data found for '{search_text}', skipping request.")
        return
    
    print("Saving results.")
    post_results(results, search_text, response_route)

print(get_game("the-witcher-3-wild-hunt"))
