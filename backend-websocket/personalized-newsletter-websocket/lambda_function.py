import json
import boto3
import jwt
import time
import datetime

def lambda_handler(event, context):
    print("event", event)
    
    # Get the event details from the request
    domain = event.get("requestContext", {}).get("domainName")
    stage = event.get("requestContext", {}).get("stage")
    routeKey = event.get("requestContext", {}).get("routeKey")
    connectionId = event.get("requestContext", {}).get("connectionId", "")
    
    if domain == None or stage == None:
        return {
        'statusCode': 403,
        'body': json.dumps('Invalid request.')
    }
        
    if routeKey == "$connect":
        # Connect - WebSocket handshake is coming from the client
        bearer_token = event.get("queryStringParameters", {}).get("auth")
        print("bearer_token", bearer_token)

        # Add authentication and validate the token
        if bearer_token == None:
            return {
            'statusCode': 403,
            'body': json.dumps('Please provide a token.')
            }
        ifExpired = verifyToken(bearer_token)
        if not ifExpired:
            return {
            'statusCode': 403,
            'body': json.dumps('Expired token.')
            }
        
        connect(event)
        print("Connected to the websocket.")
        
        return {
            'statusCode': 200,
            'body': json.dumps('Connected the websocket.')
            }
    elif routeKey == "$disconnect":
        # Disconnect the websocket
        print("Disconnected")
        return {
            'statusCode': 1001,
            'body': json.dumps('Disconnected the websocket.')
        }
    elif routeKey=="get-report":
        # Send the messages to the client after successful connection
        get_report(event,connectionId, domain, stage)
        
    return {
            'statusCode': 200,
            'body': json.dumps('Sending data.')
            }


def connect(event):
   pass

def get_report(event,connectionId,domain, stage):
    lambda_client = boto3.client('lambda')
    
    body = event.get("body", {})
    lambda_payload = json.loads(body)

    payload = {'body': lambda_payload['data']}
    print("payload - ", payload)

    resp = lambda_client.invoke(FunctionName='personalized-newsletter-lambda',InvocationType='RequestResponse',LogType='None',Payload=json.dumps(payload).encode("utf-8"))
    apig_management_client = boto3.client(
                "apigatewaymanagementapi", endpoint_url=f"https://{domain}/{stage}"
            )
    print("resp", resp)
    string_data = resp['Payload'].read().decode("utf-8")
    send_response = apig_management_client.post_to_connection(
                    Data=string_data, ConnectionId=connectionId
                )

def disconnect(domain, stage, connectionId):
    apig_management_client = boto3.client(
                "apigatewaymanagementapi", endpoint_url=f"https://{domain}/{stage}"
            )
    print("connectionId", connectionId)
    send_response = apig_management_client.delete_connection(
                    ConnectionId=connectionId
                )
      
def verifyToken(bearer_token):
    ## To validate the token
    decoded_data = jwt.decode(jwt=bearer_token,
                                algorithms=["RS256"],options={"verify_signature": False},)
    
    exp_time = decoded_data["exp"]

    print("exp_time", int(exp_time))
    print("int(time.time())", int(time.time()))

    if exp_time != 0 and int(exp_time) < int(time.time()) :
        print("Expired token")
        return False
    else:
        return True