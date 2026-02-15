from flask import Blueprint, jsonify, request
from .data import ADS, METRICS

api = Blueprint("api", __name__)

def match_ad(ad_id):
    return next((a for a in ADS if a["id"] == ad_id), None)

@api.route("/ads", methods=["GET"])
def ads():
    return jsonify(ADS)

@api.route("/ads/<int:ad_id>", methods=["GET"])
def ad_details(ad_id):
    ad = match_ad(ad_id)
    if not ad:
        return jsonify({"error": "Ad not found"}), 404
    metrics = [m for m in METRICS if m["ad_id"] == ad_id]
    ad_with_metrics = {**ad, "metrics": metrics}
    return jsonify(ad_with_metrics)

@api.route("/ads/stats", methods=["GET"])
def stats():
    start = request.args.get("start")
    end = request.args.get("end")
    if not start or not end:
        return jsonify({"error": "start and end query params are required"}), 400

    total_impressions = 0
    total_clicks = 0
    total_spend = 0.0
    total_revenue = 0.0

    for m in METRICS:
        if start <= m["date"] <= end:
            total_impressions += m["impressions"]
            total_clicks += m["clicks"]
            total_spend += m["spend"]
            total_revenue += m["revenue"]

    return jsonify({
        "impressions": total_impressions,
        "clicks": total_clicks,
        "spend": total_spend,
        "revenue": total_revenue,
    })