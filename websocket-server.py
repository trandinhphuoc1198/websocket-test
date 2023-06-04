import websockets
import asyncio
import json

connections = {}

async def init(websocket,message):
    name = message['name']
    #Send room status to new connection
    room_status = {
        'type' : 'init',
        'connections' : [person for person in connections],
        'is_screen_sharing' : False
    }
    await websocket.send(json.dumps(room_status))
    
    #Send info of new member to other members
    message_to_other_connections = {
        'type' : 'new connection',
        'name' : name
    }
    for person in connections.items():
        print(person)
        print(connections)
        await person[1][0].send(json.dumps(message_to_other_connections))

    connections[name] = [websocket]

    
async def streaming(websocket,channel):
    data = await websocket.recv()
    for connection in connections.get(channel,[])[1::]:
        await connection.send(data)

async def handler(websocket):

    data = await websocket.recv()

    message = json.loads(data)
    print(message)
    if message['type'] == 'init':

        await init(websocket,message)
        await streaming(websocket,message['name'])
    elif message['channel'] in connections:
        connections[message['channel']].append(websocket)
        await websocket.wait_closed()
        connections[message['channel']].remove(websocket)

async def main():
    async with websockets.serve(handler,"",9999):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())