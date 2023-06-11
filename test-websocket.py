import websockets
import asyncio
import json
import ssl
import pathlib

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
localhost_pem = pathlib.Path(__file__).with_name("localhost.pem2")
ssl_context.load_cert_chain(localhost_pem)


async def handler(websocket):
    while True:

        data = await websocket.recv()
        print(data)
        await websocket.send(data)


    

async def main():
    async with websockets.serve(handler,"",9999,ssl=ssl_context):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
