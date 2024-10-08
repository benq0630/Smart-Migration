from flask import Blueprint, request, jsonify
from .database import get_filtered_agents
import logging

main = Blueprint('main', __name__)

@main.route('/api/filter_agents', methods=['POST'])
def filter_agents():
    try:
        filters = request.json
        logging.info(f"Received filters: {filters}")
        filtered_agents = get_filtered_agents(filters)
        return jsonify(filtered_agents)
    except Exception as e:
        logging.error(f"Error in filter_agents: {str(e)}")
        return jsonify({"error": str(e)}), 500

@main.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Test successful"}), 200