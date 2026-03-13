.PHONY: help build up down logs test clean status restart rebuild install push deploy

# Variables
DOCKER_IMAGE := gaming-coins-automation
DOCKER_CONTAINER := gaming-coins-automation
COMPOSE_FILE := docker-compose.yml

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

## Help - Display all available commands
help:
	@echo "$(GREEN)═════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)Gaming Coins Hub - Automation Management$(NC)"
	@echo "$(GREEN)═════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Commands:$(NC)"
	@echo "  $(GREEN)make build$(NC)          - Build Docker image"
	@echo "  $(GREEN)make up$(NC)             - Start containers (background)"
	@echo "  $(GREEN)make down$(NC)           - Stop containers"
	@echo "  $(GREEN)make restart$(NC)        - Restart containers"
	@echo "  $(GREEN)make rebuild$(NC)        - Rebuild and restart"
	@echo ""
	@echo "$(YELLOW)Automation Commands:$(NC)"
	@echo "  $(GREEN)make test$(NC)           - Test automation once (dry run)"
	@echo "  $(GREEN)make logs$(NC)           - View live logs"
	@echo "  $(GREEN)make status$(NC)         - Check container status"
	@echo ""
	@echo "$(YELLOW)Development Commands:$(NC)"
	@echo "  $(GREEN)make install$(NC)        - Install npm dependencies"
	@echo "  $(GREEN)make clean$(NC)          - Clean build artifacts and logs"
	@echo "  $(GREEN)make reset$(NC)          - Full reset (containers + cache)"
	@echo ""
	@echo "$(YELLOW)Git Commands:$(NC)"
	@echo "  $(GREEN)make push$(NC)           - Push changes to GitHub"
	@echo "  $(GREEN)make status-git$(NC)     - Show git status"
	@echo ""
	@echo "$(YELLOW)Configuration:$(NC)"
	@echo "  $(GREEN)make env-setup$(NC)      - Setup .env.automation file"
	@echo "  $(GREEN)make env-check$(NC)      - Verify .env.automation variables"
	@echo ""

## Docker - Build image
build:
	@echo "$(YELLOW)Building Docker image...$(NC)"
	docker build -t $(DOCKER_IMAGE) .
	@echo "$(GREEN)✅ Image built successfully!$(NC)"

## Docker - Start containers
up:
	@echo "$(YELLOW)Starting containers...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Containers started!$(NC)"
	@echo "$(YELLOW)Use 'make logs' to view logs$(NC)"

## Docker - Stop containers
down:
	@echo "$(YELLOW)Stopping containers...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ Containers stopped!$(NC)"

## Docker - Restart containers
restart:
	@echo "$(YELLOW)Restarting containers...$(NC)"
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✅ Containers restarted!$(NC)"

## Docker - Rebuild and restart
rebuild: build
	@echo "$(YELLOW)Rebuilding and restarting...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up --build -d
	@echo "$(GREEN)✅ Rebuilt and restarted!$(NC)"

## Logs - View live logs
logs:
	@echo "$(YELLOW)Showing live logs (Ctrl+C to exit)...$(NC)"
	docker-compose -f $(COMPOSE_FILE) logs -f --tail=100 automation

## Test - Run automation once
test:
	@echo "$(YELLOW)Testing automation (running once)...$(NC)"
	docker-compose -f $(COMPOSE_FILE) run --rm automation node automation/scheduler.js --once
	@echo "$(GREEN)✅ Test complete!$(NC)"

## Status - Check container status
status:
	@echo "$(YELLOW)Container Status:$(NC)"
	docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(YELLOW)Resource Usage:$(NC)"
	docker stats --no-stream $(DOCKER_CONTAINER) 2>/dev/null || echo "Container not running"

## Clean - Remove build artifacts and logs
clean:
	@echo "$(YELLOW)Cleaning build artifacts and logs...$(NC)"
	rm -rf .docusaurus build dist .cache .turbo
	rm -rf automation/logs/*.log
	@echo "$(GREEN)✅ Cleaned!$(NC)"

## Reset - Full reset (containers + cache + volumes)
reset: down clean
	@echo "$(YELLOW)Performing full reset...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v
	rm -rf node_modules automation/logs
	@echo "$(GREEN)✅ Full reset complete!$(NC)"

## Install - Install npm dependencies
install:
	@echo "$(YELLOW)Installing npm dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

## Git - Push changes
push:
	@echo "$(YELLOW)Checking git status...$(NC)"
	git status
	@echo ""
	@read -p "$(YELLOW)Continue with push? (y/n): $(NC)" confirm && [ "$${confirm}" = "y" ] || (echo "Cancelled"; exit 1)
	git add -A
	git commit -m "🔄 Update $(shell date +%Y-%m-%d)" || echo "Nothing to commit"
	git push origin main
	@echo "$(GREEN)✅ Pushed to GitHub!$(NC)"

## Git - Show status
status-git:
	@echo "$(YELLOW)Git Status:$(NC)"
	git status
	@echo ""
	@echo "$(YELLOW)Recent Commits:$(NC)"
	git log --oneline -5

## Environment - Setup .env.automation
env-setup:
	@echo "$(YELLOW)Setting up .env.automation...$(NC)"
	@if [ ! -f automation/.env.automation ]; then \
		cp automation/.env.example automation/.env.automation; \
		echo "$(GREEN)✅ Created automation/.env.automation$(NC)"; \
		echo "$(YELLOW)⚠️  Edit automation/.env.automation and add your GitHub token$(NC)"; \
	else \
		echo "$(YELLOW)automation/.env.automation already exists$(NC)"; \
	fi

## Environment - Check variables
env-check:
	@echo "$(YELLOW)Checking .env.automation variables...$(NC)"
	@if [ ! -f automation/.env.automation ]; then \
		echo "$(RED)❌ automation/.env.automation not found!$(NC)"; \
		echo "$(YELLOW)Run 'make env-setup' first$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Variables found:$(NC)"
	@grep -E "^[A-Z_]+" automation/.env.automation | grep -v "^#" | sed 's/=.*//' | sort

## Development - Install and build
dev-setup: install
	@echo "$(YELLOW)Setting up development environment...$(NC)"
	npm install
	@echo "$(GREEN)✅ Development environment ready!$(NC)"

## Documentation - Show relevant docs
docs:
	@echo "$(GREEN)📚 Documentation:$(NC)"
	@echo "  - DOCKER_SETUP.md       - Docker configuration"
	@echo "  - AUTOMATION_SETUP.md   - Complete automation setup"
	@echo "  - automation/README.md  - Technical documentation"
	@echo ""
	@echo "$(YELLOW)Run 'cat DOCKER_SETUP.md' to view Docker setup guide$(NC)"

## All - Display quick reference
quick-ref:
	@echo "$(GREEN)═════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)QUICK REFERENCE$(NC)"
	@echo "$(GREEN)═════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)First Time Setup:$(NC)"
	@echo "  $$ make env-setup       # Setup .env.automation"
	@echo "  $$ make build           # Build image"
	@echo "  $$ make test            # Test once"
	@echo ""
	@echo "$(YELLOW)Daily Operations:$(NC)"
	@echo "  $$ make up              # Start automation"
	@echo "  $$ make logs            # View logs"
	@echo "  $$ make status          # Check status"
	@echo "  $$ make down            # Stop automation"
	@echo ""
	@echo "$(YELLOW)Troubleshooting:$(NC)"
	@echo "  $$ make rebuild         # Rebuild everything"
	@echo "  $$ make reset           # Full system reset"
	@echo "  $$ make clean           # Clear cache and logs"
	@echo ""
	@echo "$(GREEN)Full help: run 'make help'$(NC)"
	@echo "$(GREEN)═════════════════════════════════════════════════════════════$(NC)"

.DEFAULT_GOAL := help
