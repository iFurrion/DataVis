# Sleep Quality vs Work Performance

This README focuses on the two key components:

- `index.html`: The main visualization interface.
- `joined_for_d3.csv`: The data file used by the visualization.

---

##  Setup Instructions

To view and interact with the visualization locally, follow these steps:

1. **Clone or download the repository**, ensuring the following files are present:
   - `index.html`
   - `joined_for_d3.csv`

2. **Open a terminal** in the directory containing these files.

3. **Start a simple HTTP server** using Python:
   ```bash
   cd [PROJECT LOCATION]
   ```
   Where [PROJECT LOCATION] should be replaced with the path you have downloaded the project into.
   ```bash
   python -m http.server
   ```

   it should output a message like:
   ```bash
   Serving HTTP on :: port 8000 (http://[::]:8000/)
   ```

5. **Launch a browser window** and type the following text into the url bar:
```bash
http://localhost:8000
```

6. Depending on your file structure, you might need to manually navigate to the file location to display the data visualizataion.

7. The data should be displayed on the screen

### This project has been tested on opera, a chromium based browser. Therefore any other chromium based browser should also work. However, Firefox and Safari were never tested. There is no reason for these two browsers to cause a problem.
