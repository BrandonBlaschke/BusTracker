import csv
import json

SHAPE_ID = "10007006"

points = []

with open('D:\\Documents\\Coding\\Bus Tracker\\data\\routes\\route_7\\shapes.csv', newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    rows = [
        row for row in reader
        if row["shape_id"] == SHAPE_ID
    ]

rows.sort(key=lambda r: int(r["shape_pt_sequence"]))

for row in rows:
    points.append([
        float(row["shape_pt_lon"]),
        float(row["shape_pt_lat"])
    ])

geojson = {
    "type": "Feature",
    "properties": {
        "shape_id": SHAPE_ID
    },
    "geometry": {
        "type": "LineString",
        "coordinates": points
    }
}

with open("route7.geojson", "w") as f:
    json.dump(geojson, f)

print(
    f"Created route7.geojson with {len(points)} points"
)