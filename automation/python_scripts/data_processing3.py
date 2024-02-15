import boto3
import tqdm
import pandas as pd
import csv
import time
from Lambdas.embedding2cluster import cluster_from_embedding
import argparse
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_session_and_client(region):
    try:
        boto3.setup_default_session(region_name=region)
        logger.info("Boto3 session successfully set up.")
    except Exception as e:
        logger.error(f"Failed to set up Boto3 session. Error: {e}")
        raise

def process_articles(articles_df, kmeans_endpoint_name, sm_client):
    output = []

    for i, row in tqdm.tqdm(articles_df.iterrows(), total=articles_df.shape[0], desc='Processing Articles'):
        embedding = json.loads(row['article_embedding'])
        article_cluster = cluster_from_embedding(embedding, kmeans_endpoint_name, sm_client)

        Item = {
            'articleClusterId': str(int(float(article_cluster))),
            'articleCreationTimestamp': int(row['creation_timestamp']),
            'articleId': str(row['item_id']),
            'articleText': str(row['english_text']),
            'articleTitle': str(row['title']),
            'articleSummary': str(row['article_summary']),
            'articleHook': str(row['article_hook']),
            'articleTrigger': str(row['article_trigger']),
            'articleGenre': str(row['article_genre']),
            'articleLanguage': str(row['lang']),
            'elligableUsers': 'All'
        }

        output.append(Item)

    return output

def save_to_csv(data, keys, output_path):
    try:
        with open(output_path, 'w', newline='') as output_file:
            dict_writer = csv.DictWriter(output_file, keys)
            dict_writer.writeheader()
            dict_writer.writerows(data)
        logger.info(f"Data successfully saved to {output_path}.")
    except Exception as e:
        logger.error(f"Failed to save data to {output_path}. Error: {e}")

def main():
    # Start measuring script execution time
    start_time = time.time()
    logger.info("\n\nScript to perform KMeans clustering on articles and save data for breaking news main table to S3")

    # Parsing command-line arguments
    parser = argparse.ArgumentParser(description='Script to perform KMeans clustering on articles.')
    parser.add_argument('--endpoint_name', type=str, help='S3 bucket name')
    parser.add_argument('--endpoint_region', type=str, help='model endpoint region')
    args = parser.parse_args()

    endpoint = args.endpoint_name
    endptregion = args.endpoint_region

    setup_session_and_client(endptregion)
    sm_client = boto3.client('runtime.sagemaker')
    kmeans_endpoint_name = endpoint

    try:
        articles_new = pd.read_csv("./Data/InitialProcessing/deskdrop_articles_for_xenon_new.csv")  # Change path

        output_data = process_articles(articles_new, kmeans_endpoint_name, sm_client)

        keys = output_data[0].keys()
        output_path = './Data/Dynamodb/BreakingNewsMainTable.csv'
        save_to_csv(output_data, keys, output_path)

    except Exception as e:
        logger.error(f"An error occurred: {e}")

    finally:
        end_time = time.time()
        execution_time = end_time - start_time
        logger.info(f"Script execution time: {execution_time} seconds")

if __name__ == "__main__":
    main()  #takes around 2 mins