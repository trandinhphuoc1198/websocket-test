import websockets
import asyncio
import json
import ssl
import pathlib

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
localhost_pem = pathlib.Path(__file__).with_name("localhost.pem2")
ssl_context.load_cert_chain(localhost_pem)

connections = {}

async def init(websocket,message):
    name = message['name']
    device = 'hasCamera' if message['device']==2 else 'audio'

    while connections.get(name,None):
        await websocket.send(json.dumps({'type':'error','msg':'duplicated name'}))
        message = json.loads(await websocket.recv())
        name = message['name']

    connectionsData = [connection[0] for connection in connections.values()]

    #Send info of new member to other members
    message_to_other_connections = {
        'type' : 'newConnection',
        'connectionData' : [name,device]
    }
    for connection in connections.values():
        await connection[1].send(json.dumps(message_to_other_connections))
    connections[name] = [(name,device),websocket]
    
    #Send room status to new connection
    room_status = {
        'type' : 'initChat',
        'connectionsData' : connectionsData,
    }
    await websocket.send(json.dumps(room_status))
    
    return name

    
async def streaming(websocket,channel):
    try:
        while True:
            data = await websocket.recv()
            for connection in connections.get(channel,[])[2::]:
                await connection.send(data)
    except Exception as e:
        print(e)
        for connection in connections.get(channel,[])[2::]:
                await connection.close()
        del connections[channel]

async def handler(websocket):

    data = await websocket.recv()

    message = json.loads(data)
    print(message)
    if message['type'] == 'init':
        channel = await init(websocket,message)
        await streaming(websocket,channel)
    elif message['channel'] in connections:
        connections[message['channel']].append(websocket)
        await websocket.wait_closed()
        connections[message['channel']].remove(websocket)

async def main():
    async with websockets.serve(handler,"",9999,ssl=ssl_context):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
