# CSV Import Guide

You can import flashcard sets from CSV files to quickly add multiple cards at once.

## CSV Format

Your CSV file should have two columns:
- **Column 1**: Front of the card (question/prompt)
- **Column 2**: Back of the card (answer/response)

### Example CSV:

```csv
front,back
What is the capital of France?,Paris
What is 2+2?,4
Who wrote Romeo and Juliet?,William Shakespeare
```

Or without headers:

```csv
What is the capital of France?,Paris
What is 2+2?,4
Who wrote Romeo and Juliet?,William Shakespeare
```

## Supported Formats

- **Comma-separated** (`.csv`): `front,back`
- **Semicolon-separated**: `front;back`
- **Tab-separated**: `front	back`

## Special Characters

- **Quotes**: If your text contains commas, wrap it in quotes:
  ```csv
  "Question with, comma","Answer with, comma"
  ```

- **Escaped quotes**: Use double quotes for quotes inside quoted fields:
  ```csv
  "He said ""Hello""","Response"
  ```

## How to Import

1. Click the **"Import CSV"** button in the header
2. Select your CSV file
3. Enter a name for the flashcard set
4. Click **"Confirm"**
5. Your cards will be imported!

## Tips

- **Headers are optional**: The importer will detect if your first row is a header
- **Empty rows are skipped**: Blank lines won't create empty cards
- **Large files**: Can import hundreds of cards at once
- **File name**: The file name will be suggested as the set name (you can change it)

## Example Use Cases

- Import vocabulary lists
- Import study guides
- Import quiz questions
- Bulk create cards from spreadsheets

## Troubleshooting

### "No valid cards found"
- Make sure your CSV has at least 2 columns
- Check that rows aren't completely empty
- Verify the file is a valid CSV format

### "Failed to read file"
- Make sure the file is a `.csv` file
- Check that the file isn't corrupted
- Try opening the file in a text editor to verify format

### Cards not importing correctly
- Check that commas in text are properly quoted
- Verify the delimiter (comma, semicolon, or tab) is consistent
- Make sure each row has exactly 2 columns

