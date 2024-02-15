import time
import boto3
import pandas as pd
import json, argparse

print('Script to ingest interactions data to dynamo. This script should be run after the dynamo db tables are created')
parser = argparse.ArgumentParser(description='Script to ingest interactions data to dynamo.')
parser.add_argument('--region', type=str, help='aws region')
parser.add_argument('--table_name', type=str, help='Dynamo table')
args = parser.parse_args()

region=args.region
dynamodb_table_name = args.table_name

boto3.setup_default_session(region_name=region)
DYNAMORESOURCE = boto3.resource('dynamodb')

table = DYNAMORESOURCE.Table(dynamodb_table_name)

def process_article():
    data = pd.read_csv('./Data/Dynamodb/ArticleUserInteractionsTable.csv')

    with table.batch_writer() as batch:
        for index, row in data.iterrows():
            userId = str(row['userId'])
            articleInteractions = json.loads(row['articleInteractions'].replace("'", '"'))
            item = {'userId': userId, 'articleInteractions': articleInteractions}
            batch.put_item(Item=item)

start_time = time.time()
process_article()
end_time = time.time()
execution_time = end_time - start_time
print(f"Script execution time: {execution_time} seconds")  # 27 secs