import json
import os
from requests import post
import requests
from bs4 import BeautifulSoup


API_KEY_PLAT_PRICES = "%20F62pWUvUQCGZg1B3G1Gg6Bhf3FvTKy10"
URL = "https://platprices.com/api.php?key=%20F62pWUvUQCGZg1B3G1Gg6Bhf3FvTKy1010&name=it%20takes%20two&region=Pl"


def clean_description(html_desc):
    if not html_desc:
        return ""
    soup = BeautifulSoup(html_desc, "html.parser")
    return soup.get_text(separator="\n")


def get_game(name):
    url = f"https://platprices.com/api.php?key={API_KEY_PLAT_PRICES}&name={name}&region=Pl"
    response = requests.get(url)
    data = response.json()

    return {
        "title": data.get("GameName"),
        "game_id": data.get("GameID"),
        "current_price": data.get("SalePrice"),
        "regular_price": data.get("BasePrice"),
        "discounted_until": data.get("DiscountedUntil"),
        "description": clean_description(data.get("Desc")),
        "image": data.get("Img"),
        "screenshot": data.get("Screenshot1"),
        "ps_store_url": data.get("PSStoreURL"),
    }


def save_results(results):
    data = {"results": results}
    FILE = os.path.join("API", "results.json")
    with open(FILE, "w") as f:
        json.dump(data, f)


def post_results(results, search_text, endpoint):
    headers = {"Content-Type": "application/json"}
    data = {"data": results, "search_text": search_text}

    print("Sending request to", endpoint)
    response = post("http://127.0.0.1:5000" + endpoint, headers=headers, json=data)
    print("Status code:", response.status_code)


def main(search_text, response_route):
    print(f"Running main() for {search_text}")

    results = get_game(search_text)

    if not results:
        print(f"No data found for '{search_text}', skipping request.")
        return

    save_results(results)
    print("Saving results.")

    post_results(results, search_text, response_route)

    return results
