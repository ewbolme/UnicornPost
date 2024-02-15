import json

def cluster_from_embedding(embedding, endpoint_name: str, sm_client):
    
    embedding_payload = json.dumps({"features": embedding}).encode('utf-8')

    embedded_response = sm_client.invoke_endpoint(EndpointName=endpoint_name, 
                                                ContentType='application/jsonlines', 
                                                Body=embedding_payload)

    return str(json.loads(embedded_response['Body'].read())['predictions'][0]['closest_cluster'])