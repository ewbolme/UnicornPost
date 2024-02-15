import pandas as pd
import json
import tqdm
import boto3
import argparse
import logging
import time
from Lambdas.embedding2cluster import cluster_from_embedding

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_boto3_session(region):
    try:
        boto3.setup_default_session(region_name=region)
        logger.info("Boto3 session successfully set up.")
    except Exception as e:
        logger.error(f"Failed to set up Boto3 session. Error: {e}")
        raise

def fetch_article_cluster(embedding, endpoint_name, sm_client):
    try:
        return cluster_from_embedding(embedding, endpoint_name, sm_client)
    except Exception as e:
        logger.error(f"Error while fetching article cluster: {e}")
        return None

def save_cluster_lookup_table(df, output_path):
    try:
        df.to_csv(output_path, index=False)
        logger.info(f"Cluster lookup table data saved to {output_path}")
    except Exception as e:
        logger.error(f"Failed to save cluster lookup table data. Error: {e}")

def main():
    # Start measuring script execution time
    start_time = time.time()
    logger.info("Creating data for cluster lookup table by fetching article cluster id from the SageMaker KNN clustering model just deployed")

    # Parsing command-line arguments
    parser = argparse.ArgumentParser(description='Script to perform KMeans clustering on articles.')
    parser.add_argument('--endpoint_name', type=str, help='S3 bucket name')
    parser.add_argument('--region', type=str, help='AWS region')
    args = parser.parse_args()

    endpoint = args.endpoint_name
    region = args.region

    logger.info(f"SageMaker endpoint name: {endpoint}, Region given: {region}")

    # Set up Boto3 session
    setup_boto3_session(region)
    sm_client = boto3.client('runtime.sagemaker')
    kmeans_endpoint_name = endpoint

    articles_old = pd.read_csv("./Data/TranslatedSummarized/deskdrop_articles_for_xenon_old.csv")
    # embedding_list = [json.loads(article_embedding) for article_embedding in articles_old.article_embedding]
    embedding_list = []

    for index, article_embedding in enumerate(articles_old.article_embedding):
        try:
            decoded_article = json.loads(article_embedding)
            embedding_list.append(decoded_article)
        except json.JSONDecodeError:
            print(f"Skipping row with invalid JSON at index {index}: {article_embedding}")
            articles_old = articles_old.drop(index=index)
    print("Going to model for finding cluster")
    article_cluster = []
    for embedding in tqdm.tqdm(embedding_list, desc="Fetching Article Clusters"):
        cluster = fetch_article_cluster(embedding, kmeans_endpoint_name, sm_client)
        article_cluster.append(cluster)

    articles_old['article_cluster'] = article_cluster
    articles_old['article_cluster'] = articles_old['article_cluster'].apply(lambda x: str(int(float(x))))
    articles_old.to_csv("./Data/ArticleClusterAdded/deskdrop_articles.csv", index=False)

    df = pd.read_csv('./Data/ArticleClusterAdded/deskdrop_articles.csv')
    df = df[['article_cluster', 'item_id', 'article_summary', 'title', 'article_hook', 'article_trigger', 'creation_timestamp']]

    df.rename(columns={
        "article_cluster": "articleClusterId",
        "item_id": "articleId",
        "article_summary": "articleSummary",
        "title": "articleTitle",
        "article_hook": "articleHook",
        "article_trigger": "articleTrigger",
        "creation_timestamp": "articleCreationTimestamp",
    }, inplace=True)

    # Save Cluster Lookup Table
    save_cluster_lookup_table(df, './Data/Dynamodb/ClusterLookupTable.csv')



    end_time = time.time()
    execution_time = end_time - start_time
    logger.info(f"Script execution time: {execution_time} seconds")

if __name__ == "__main__":
    main()