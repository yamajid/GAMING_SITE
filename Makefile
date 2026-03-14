.PHONY: help install start test clean push status-git env-setup env-check

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
	@echo "$(YELLOW)Setup Commands:$(NC)"
	@echo "  $(GREEN)make install$(NC)        - Install npm dependencies"
	@echo "  $(GREEN)make env-setup$(NC)      - Setup .env.automation file"
	@echo "  $(GREEN)make env-check$(NC)      - Verify .env.automation variables"
	@echo ""
	@echo "$(YELLOW)Development Commands:$(NC)"
	@echo "  $(GREEN)make start$(NC)          - Start local dev server"
	@echo "  $(GREEN)make test$(NC)           - Test automation once"
	@echo "  $(GREEN)make clean$(NC)          - Clean build artifacts and logs"
	@echo ""
	@echo "$(YELLOW)Git Commands:$(NC)"
	@echo "  $(GREEN)make push$(NC)           - Push changes to GitHub"
	@echo "  $(GREEN)make status-git$(NC)     - Show git status"
	@echo ""

## Install - Install npm dependencies
install:
	@echo "$(YELLOW)Installing npm dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

## Start - Run development server
start:
	@echo "$(YELLOW)Starting development server...$(NC)"
	npm start

## Test - Run automation once
test:
	@echo "$(YELLOW)Testing automation (running once)...$(NC)"
	node automation/scheduler.js --once
	@echo "$(GREEN)✅ Test complete!$(NC)"

## Clean - Remove build artifacts and logs
clean:
	@echo "$(YELLOW)Cleaning build artifacts and logs...$(NC)"
	rm -rf .docusaurus build dist .cache .turbo
	rm -rf automation/logs/*.log
	@echo "$(GREEN)✅ Cleaned!$(NC)"

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

## Quick ref
quick-ref:
	@echo "$(GREEN)═════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)QUICK REFERENCE$(NC)"
	@echo "$(GREEN)═════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)First Time Setup:$(NC)"
	@echo "  $$ make install         # Install dependencies"
	@echo "  $$ make env-setup       # Setup .env.automation"
	@echo "  $$ make test            # Test automation once"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  $$ make start           # Run dev server"
	@echo "  $$ make test            # Test automation"
	@echo "  $$ make clean           # Clear cache and logs"
	@echo ""
	@echo "$(YELLOW)Git:$(NC)"
	@echo "  $$ make push            # Commit and push"
	@echo "  $$ make status-git      # Check git status"
	@echo ""
	@echo "$(GREEN)Full help: run 'make help'$(NC)"
	@echo "$(GREEN)═════════════════════════════════════════════════════════════$(NC)"

.DEFAULT_GOAL := help
