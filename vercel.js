{
    "functions": {
        "api/upload.js": {
            "maxDuration": 10
        }
    },
    "rewrites": [
        { "source": "/api/(.*)", "destination": "/api/$1" }
    ]
}
