import pandas as pd
from bs4 import BeautifulSoup, MarkupResemblesLocatorWarning
import re
import warnings
import csv
import subprocess
import argparse
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Start measuring script execution time
start_time = time.time()
logger.info("Script to add data for personalize models to S3")

# Parsing command-line arguments
parser = argparse.ArgumentParser(description='Script to add data for personalize models to S3')
parser.add_argument('--bucket', type=str, help='S3 bucket name')
args = parser.parse_args()

bucket_name = args.bucket
logger.info(f"Got bucket name: {bucket_name}")


def process_html_text(html_text: str) -> str:
    """
    This function exists to process text prior to using it to create a personalize model it takes as an input a text string and returns a text string
    """
    if type(html_text) == str:
        html_text = html_text.replace("<p>&nbsp;</p>", "")  # remove &nbsp from the text
        html_text = html_text.replace("<p></p>", "")  # remove <p></p> from the text
        html_text = html_text.replace("<p> </p>", "")  # remove <p> </p> from the text

        # remove hyper links form the text
        a_pattern = re.compile("<a.*?>")
        html_text = re.sub(a_pattern, "", html_text)
        html_text = html_text.replace("</a>", "")
        # remove spans from the text
        span_pattern = re.compile("<span.*?>")
        html_text = re.sub(span_pattern, "", html_text)
        html_text = html_text.replace("</span>", "")
        class_pattern = re.compile("<class.*?>")
        html_text = re.sub(class_pattern, "", html_text)
        html_text = html_text.replace("</class>", "")
        # remove <b> and </b> from the text
        html_text = html_text.replace("<b>", "")
        html_text = html_text.replace("</b>", "")
        # remove .  . and \n from the text
        html_text = html_text.replace("\n", " ")
        # remove .  . and @ from the text
        html_text = html_text.replace("@", "")
        # remove .  . and - from the text
        html_text = html_text.replace("-", "")
        # add escapes to single quotes
        html_text = html_text.replace("\"", "\\\"")
        # remove HTML
        cleanr = re.compile("^.*?>|<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});")
        html_text = re.sub(cleanr, "", html_text)
        # remove extra space etc.
        html_text = " ".join(html_text.split())
        # specifics for Amazon dataset
        html_text = html_text.replace(".  .", "")
        warnings.simplefilter("ignore", MarkupResemblesLocatorWarning)
        soup = BeautifulSoup(html_text, "html.parser")
        text = soup.find_all(string=True)
        for index, t in enumerate(text):
            if t[-1] != ".":
                text[index] += "."
        return " ".join(text).strip()
    else:
        return " "

try:
    articles_old = pd.read_csv("./Data/ArticleClusterAdded/deskdrop_articles.csv")
    articles_old.article_summary = articles_old.article_summary.apply(process_html_text)
    articles_old_personalize = articles_old[['creation_timestamp', 'item_id', 'lang','article_summary', 'article_genre', 'article_cluster']]
    articles_old_personalize.to_csv("./Data/PersonalizeReady/deskdrop_articles_one_to_one.csv")

    deskdrop_articles_one_to_one = f"s3://{bucket_name}/personalize_ready/deskdrop_articles_one_to_one.csv"
    subprocess.run(["aws", "s3", "cp", "./Data/PersonalizeReady/deskdrop_articles_one_to_one.csv", deskdrop_articles_one_to_one])

    old_interactions_mlfeatures = pd.read_csv("./Data/InitialProcessing/deskdrop_interactions_old.csv")
    if 'user_device_type' in old_interactions_mlfeatures.columns:
        old_interactions_mlfeatures.drop(columns='user_device_type', inplace=True)
    old_interactions_mlfeatures.to_csv("./Data/PersonalizeReady/deskdrop_interactions_one_to_one.csv")

    deskdrop_interactions_one_to_one = f"s3://{bucket_name}/personalize_ready/deskdrop_interactions_one_to_one.csv"
    subprocess.run(["aws", "s3", "cp", "./Data/PersonalizeReady/deskdrop_interactions_one_to_one.csv", deskdrop_interactions_one_to_one])

    item_id_lookup = dict(zip(articles_old.item_id, articles_old.article_cluster))
    # print(item_id_lookup)
    old_interactions_mlfeatures = pd.read_csv("./Data/InitialProcessing/deskdrop_interactions_old.csv")
    old_interactions_mlfeatures['article_cluster'] = old_interactions_mlfeatures.item_id.map(item_id_lookup)
    old_interactions_mlfeatures['article_cluster'] = old_interactions_mlfeatures['article_cluster'].apply(lambda x: int(x) if isinstance(x, (int, float)) and not pd.isna(x) else 0)    
    print(old_interactions_mlfeatures.head(5))
    if 'user_device_type' in old_interactions_mlfeatures.columns:
        old_interactions_mlfeatures.drop(columns='user_device_type', inplace=True)

    old_interactions_mlfeatures.drop(columns=old_interactions_mlfeatures.columns[~old_interactions_mlfeatures.columns.isin(['timestamp', 'event_type', 'user_id', 'user_device_type', 'article_cluster'])], inplace=True)
    old_interactions_mlfeatures.rename(columns={'article_cluster': 'item_id'}, inplace=True)
    old_interactions_mlfeatures.to_csv("./Data/PersonalizeReady/deskdrop_interactions_clustered.csv")

    deskdrop_interactions_clustered = f"s3://{bucket_name}/personalize_ready/deskdrop_interactions_clustered.csv"
    subprocess.run(["aws", "s3", "cp", "./Data/PersonalizeReady/deskdrop_interactions_clustered.csv", deskdrop_interactions_clustered])

    logger.info("Added data for personalize models to S3 successfully")

except Exception as e:
    logger.error(f"An error occurred: {e}")

finally:
    end_time = time.time()
    execution_time = end_time - start_time
    logger.info(f"Script execution time: {execution_time} seconds")