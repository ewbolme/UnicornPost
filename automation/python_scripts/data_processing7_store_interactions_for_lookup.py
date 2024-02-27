import pandas as pd
import csv
import time

def read_csv(csv_file):
    df=pd.read_csv(csv_file,usecols= ['timestamp','event_type','item_id','user_id'])

    # Convert 'timestamp' column to datetime if it's not already in datetime format
    df['timestamp1'] = pd.to_datetime(df['timestamp'])

    df = df.drop_duplicates()
    df_sorted = df.sort_values(by=['user_id','timestamp'], ascending=[True,False])
    df_unique = df_sorted.drop_duplicates(subset=['user_id', 'item_id'])
    df_unique.reset_index(drop=True, inplace=True)
    grouped_df = df_unique.groupby('user_id').apply(lambda x: dict(zip(x['item_id'], x['timestamp'])))

    return grouped_df

def data_to_dynamo(filepath):

    output = []

    df = read_csv(filepath)

    for user_id, articles in df.items():
        item = {
                'userId': str(user_id), 
                'articleInteractions': {}
                }
        # print(item)
        
        for i, (item_id, timestamp) in enumerate(articles.items()):
            item['articleInteractions'][str(item_id)] = timestamp

        # print("\n\nitem here:",item)
        output.append(item)

    try:
        keys = output[0].keys()
        with open('./Data/Dynamodb/ArticleUserInteractionsTable.csv', 'w', newline='') as output_file:
            dict_writer = csv.DictWriter(output_file, keys)
            dict_writer.writeheader()
            dict_writer.writerows(output)
    except Exception as e:
        print(e)




if __name__ == "__main__":
    print("\n\nScript 7 will make the data ready for User interactions table in dynamo DB")
    # Start measuring script execution time
    start_time = time.time()
    csv_file = "./Data/PersonalizeReady/deskdrop_interactions_one_to_one.csv"
    data_to_dynamo(filepath= csv_file)
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Script execution time: {execution_time} seconds")