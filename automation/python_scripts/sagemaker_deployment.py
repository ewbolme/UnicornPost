import json
import numpy as np
import pandas as pd
from sagemaker import KMeans
from sagemaker.serverless import ServerlessInferenceConfig
import argparse
import time
import boto3
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train_and_deploy_kmeans_clustering_model(args):
    try:
        # Start measuring script execution time
        start_time = time.time()
        logger.info("Script to train the KMeans Clustering model on SageMaker")

        role = args.role
        bucket_name = args.bucket
        model = args.model_name
        endpoint = args.endpoint_name
        region = args.region
        num_clusters = args.cluster_number
        logger.info(
            "\nRole given: %s\nBucket name given: %s\nModel name given: %s\nSageMaker endpoint name: %s\nRegion given: %s",
            role,
            bucket_name,
            model,
            endpoint,
            region,
        )

        boto3.setup_default_session(region_name=region)

        # Load data
        articles_old = pd.read_csv(
            "./Data/TranslatedSummarized/deskdrop_articles_for_xenon_old.csv"
        )

        output_path = "s3://" + bucket_name + "/SagemakerOutput/"
        logger.info("\nSaving to the output path model artifacts: %s", output_path)

        # Train KMeans model
        kmeans = KMeans(
            role=role,
            instance_count=1,
            instance_type="ml.c4.xlarge",
            output_path=output_path,
            k=num_clusters,
            num_trials=100,
            epochs=10,
        )

        # embedding_list = [json.loads(article_embedding) for article_embedding in articles_old.article_embedding]

        # Handle invalid JSON values in 'article_embedding'
        embedding_list = []
        problematic_rows = []

        for index, article_embedding in enumerate(articles_old.article_embedding):
            try:
                if pd.notna(article_embedding):
                    embedding_list.append(json.loads(article_embedding))
                else:
                    logger.warning(
                        "Found a null or NaN value in 'article_embedding'. Skipping."
                    )
            except json.decoder.JSONDecodeError as e:
                logger.error(
                    "Error decoding JSON in 'article_embedding' for row %d: %s",
                    index,
                    str(e),
                )
                problematic_rows.append(index)

        # Save problematic rows to a CSV file
        if problematic_rows:
            problematic_df = articles_old.iloc[problematic_rows]
            problematic_df.to_csv(
                "./Data/TranslatedSummarized/problematic_rows.csv", index=False
            )
            logger.info(
                "Problematic rows saved to 'problematic_rows.csv' for further inspection."
            )

        kmeans.fit(kmeans.record_set(np.asarray(embedding_list, dtype=np.float32)))

        # Deploy KMeans model
        serverless_config = ServerlessInferenceConfig(
            memory_size_in_mb=3072, max_concurrency=20
        )
        kmeans_predictor = kmeans.deploy(
            endpoint_name=endpoint,
            model_name=model,
            serverless_inference_config=serverless_config,
        )

        end_time = time.time()
        execution_time = end_time - start_time
        logger.info("Script execution time: %s seconds", execution_time)

    except Exception as e:
        logger.error("An error occurred: %s", str(e))
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Script to perform KMeans clustering on articles."
    )
    parser.add_argument("--role", type=str, help="SageMaker role ARN")
    parser.add_argument("--bucket", type=str, help="S3 bucket name")
    parser.add_argument("--model_name", type=str, help="Model name like k means")
    parser.add_argument("--endpoint_name", type=str, help="Endpoint name to be")
    parser.add_argument("--region", type=str, help="AWS region")
    parser.add_argument("--cluster_number", type=str, help="AWS region")
    args = parser.parse_args()

    train_and_deploy_kmeans_clustering_model(args)
