import asyncio
import aiohttp
import json

async def main():
    async with aiohttp.ClientSession() as session:
        async with session.get("http://127.0.0.1:9222/json") as resp:
            # We don't have chrome running on 9222 yet
            pass

print("Test script ready")
