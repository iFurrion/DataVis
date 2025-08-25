import pandas as pd
import matplotlib.pyplot as plt

# Load the CSV file
df = pd.read_csv('Extended_Employee_Performance_and_Productivity_Data.csv')

# Replace 'Performance Score' with the actual column name if different
performance_scores = df['Performance_Score']

plt.figure(figsize=(8, 6))
plt.hist(performance_scores, bins=20, color='skyblue', edgecolor='black')
plt.title('Distribution of Performance Scores')
plt.xlabel('Performance Score')
plt.ylabel('Frequency')
plt.grid(axis='y', alpha=0.75)
plt.tight_layout()
plt.show()