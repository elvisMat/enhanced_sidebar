### Enhanced Sidebar

Custom Sidebar Which support custom links and categorizes

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app https://github.com/ibrahim317/enhanced_sidebar --branch develop
bench install-app enhanced_sidebar
```
### Youtube Video
[![Enhanced Sidebar Tutorial](https://img.youtube.com/vi/sa8doUqDBVY/0.jpg)](https://www.youtube.com/watch?v=sa8doUqDBVY)

## Screenshot
<img width="1845" height="634" alt="Screenshot from 2025-12-08 15-15-01" src="https://github.com/user-attachments/assets/f6082e9b-6c05-42f3-aa7e-e5053f2371a5" />


### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/enhanced_sidebar
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

mit
