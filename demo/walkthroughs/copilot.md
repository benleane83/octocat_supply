# **GitHub Copilot Agent Mode & MCP Demo**

This demo app can be used to show a number of Copilot features:

- **General Copilot Features:**
  - **Unit Testing**: [Run and generate unit tests](#demo-enhancing-unit-tests-and-coverage) to improve coverage
  - **Agent Mode and Vision**: [Generate Cart functionality](#demo-using-vision-and-agent-to-generate-cart-functionality) with natural language prompts and images
- **Customizations**:
  - **Custom Instructions**: [Personalize Copilot responses](#demo-custom-instructions-and-repository-configuration) for internal frameworks and coding standards
  - **Custom Prompts**: [Reusable workflows](#demo-custom-prompt-files-and-reusable-workflows) and [session management](#demo-using-handoff-custom-prompt-for-session-management)
- **MCP Servers**:
  - [Generate `.feature` files and use Playwright](#demo-mcp-servers---playwright) for browser testing
  - [Interact with GitHub](#demo-mcp-servers---github) via the GitHub MCP server
- **Security**:
  - [Analyze security vulnerabilities](#demo-copilot-and-application-security) and generate fixes
- **CI/CD:**
  - **Actions**: [Generate Actions workflows](#demo-automating-deployment-with-github-actions-azure-and-bicep) for deploy/publish
  - **Infrastructure as Code**: [Generate Bicep or Terraform files](#demo-automating-deployment-with-github-actions-azure-and-bicep) for publishing
- **Copilot Coding Agent**:
  - [Hand off work to Copilot Coding Agent](#demo-using-handoff-to-copilot-coding-agent-custom-prompt-for-async-session-continuation) for async implementation
  - [Experiment in parallel](#demo-using-copilot-coding-agent-to-experiment-in-parallel) with multiple variations
  - [Self-healing DevOps](#demo-self-healing-devops) for failing workflows

> Note: For the most basic "What can Copilot do?" scenario, use the `demo-unit-test-coverage` prompt to have Agent Mode add some unit tests.

## General Copilot Features

### Demo: Enhancing Unit Tests and Coverage

#### Option 1: Using Coding Agent

If you want to demo Copilot Coding Agent, there is an Issue for improving Code Coverage on the repo - it should be Issue #2 (`Improve test coverage for API` - created as part of the demo spinup). Assign this to Copilot - that's it. This takes about 15 mins, so do this ahead of time if necessary!

#### Option 2: Live Coding

- **What to show:** Copilot generating multiple tests, executing them, analyzing coverage and self-healing, plus demonstrate efficient use of custom prompts for testing workflows.
- **Why:** Show Copilot's ability to quickly and easily generate tests, validate them, self-heal and analyze coverage. Also demonstrate how custom prompts can standardize testing practices.
- **Approach 1 - Custom Prompt (Recommended for demos):**
  1. Open the [demo-unit-test-coverage.prompt.md](../.github/prompts/demo-unit-test-coverage.prompt.md) file
  2. Show the prompt structure: pre-configured for Agent mode, comprehensive tool list, detailed testing requirements
  3. Explain how it includes specific coverage requirements, CRUD operations, error handling, etc.
  4. Click "Run" to execute the automated test generation
  5. Show how it creates comprehensive test files for both Product and Supplier routes
  6. Demonstrate the self-healing capabilities when tests fail

- **Approach 2 - Manual Chat (For deeper explanation):**
  1. Ask Copilot to `run tests, analyze coverage and add missing Branch tests to include tests for untested scenarios`
  2. Show Agent working on the tests and adding new tests for the API Branch route
  3. Show Copilot "self-healing" (if tests fail)
  4. Accept the changes
  5. Ask Copilot to `add tests for the Product route` to show generation of new tests

- **Key Takeaway**: Custom prompts can encapsulate testing best practices and ensure comprehensive coverage automatically.

### Demo: Using Vision and Agent to Generate Cart Functionality

> [!NOTE]
> **Quick Start Option**: Use the `demo-cart-page.prompt.md` custom prompt for an automated demo. This prompt will have Agent Mode implement the complete Cart Page functionality automatically with proper context and tools pre-configured.

- **What to show:** "Vibe coding" using Agent Mode and Vision to complete complex tasks, plus demonstrate custom prompt efficiency.
- **Why:** Demonstrate how Copilot Vision can detect design patterns, how Agent can understand a codebase and create complex changes over multiple files, and how custom prompts can streamline complex demos.

#### Approach 1 - Custom Prompt (Recommended for demos)

  1. Open the [demo-cart-page.prompt.md](../.github/prompts/demo-cart-page.prompt.md) file
  2. Show the prompt structure: mode: 'agent', comprehensive tool list, detailed context about the current state
  3. Attach the [cart image](../docs/design/cart.png) to the prompt
  4. Click "Run" to execute the entire cart implementation automatically
  5. Show how the custom prompt handles the complete workflow with proper context

#### Approach 2 - Manual Chat (For deeper explanation)

  1. Run the App to show the original code. Once the site starts, click on "Products" in the NavBar and show the Product Page. Add an item to the Cart - note that nothing actually happens, except a message saying, "Added to Cart". Explain that there is no Cart in the frontend app currently.
  2. Open Copilot and switch to "Plan" mode.
  3. Attach the [cart image](../docs/design/cart.png) using the paperclip icon or drag/drop to add it to the chat.
  4. Enter the following prompt:

    ```txt
    I need to implement a simple Cart Page. I also want a Cart icon in the NavBar that shows the number of items in the Cart.
    ```

  5. Highlight that Copilot has suggested changes and planned the components to add/modify.
  6. (OPTIONAL if you have the GitHub MCP Server configured): Ask Copilot to `create an issue in my repo to implement the Cart page and Cart icon`
  7. Show the issue in the repo
  8. Switch to "Agent" mode in Copilot Chat. Switch to `Claude 3.5 Sonnet` (a good implementation model) and enter this prompt:

    ```txt
    Implement the changes.
    ```

  9. Show Copilot's changes and how you can see each one and Keep/reject each one.
  10. Accept Copilot's suggested fixes.
  11. Go back to the Frontend app. Navigate to Products. Show adding items to the cart (note the icon updating). Click on the Cart icon to navigate to the Cart page. Show the total, and adding/removing items from the cart.

- **Key Takeaway**: Custom prompts provide consistency and can encapsulate complex workflows that would otherwise require multiple manual steps.

## Customizations

### Demo: Custom Prompt Files and Reusable Workflows

- **What to show:** Reusing custom prompts to streamline AI-native workflow and demonstrate prompt engineering best practices
- **Why:** Demonstrate how Copilot and VSCode use custom prompts to help streamline AI-native workflows, keep developers in the flow, and provide consistent, repeatable results.
- **How:**  
  1. **Model Comparison Prompt**: Show the [model-compare.prompt.md](../.github/prompts/model-compare.prompt.md) file in the prompts directory. Explain the YAML frontmatter (mode: 'agent', description, tools). Click the Run button in the top (or use Command Palette → "Prompts: Run Prompt") and show how it automatically selects Agent mode, fetches live documentation, and updates the comparison markdown file.
  2. **Quick Demo Prompts**: Show the available demo prompts in the `.github/prompts/` directory:
     - `demo-cart-page.prompt.md` - Complete cart implementation with vision
     - `demo-unit-test-coverage.prompt.md` - Automated test generation and coverage analysis
  3. **Custom Chat Modes**: Show `Plan`, `ModelSelection` and `BDD` modes - each outlined below.
  4. **Live Demo**: Run one of the demo prompts (e.g., `demo-unit-test-coverage.prompt.md`) to show Agent mode automatically executing a complex workflow.
  5. **Note:** Explain that custom prompts provide consistency, reduce cognitive load, and can be shared across teams for standardized workflows.

### Demo: Custom Instructions and Repository Configuration

- **What to show:** Copilot's **Custom Instructions** feature using the existing `.github/copilot-instructions.md` configuration.
- **Why:** Demonstrate that Copilot can be customized and personalized for internal libraries, coding standards, and team practices that don't exist in the foundational models.
- **How:**  
  1. Show the existing [.github/copilot-instructions.md](../.github/copilot-instructions.md) file in the repository
  2. Explain how this file provides context about:
     - Repository information (owner, repo name)
     - Architecture references
     - Build and testing instructions
  3. **Demo Enhanced Custom Instructions**:
      1. Option 1: Apply the Patch Set `Copilot: Custom Instructions`[^1] which will update the custom-insturctions file
      2. Option 2: Update the custom instructions file by hand, adding these additional guidelines

          ```markdown
          ## Additional Guidelines for REST APIs
          
          For REST APIs, use the following guidelines:
          
          * Use descriptive naming
          * Add Swagger docs for all API methods
          * Implement logging and monitoring using [TAO](../docs/tao.md)
            - assume TAO is installed and never add the package
          ```

  4. Show the [TAO](./tao.md) documentation to demonstrate the fictional internal library
  5. Ask Copilot to `add observability to the Supplier route using our internal standards`
  6. Show how Copilot uses the custom instructions to implement TAO observability patterns
  7. **Note**: Explain that this will not compile since TAO doesn't really exist - this demonstrates how custom instructions can reference internal frameworks
  8. **Key Takeaway**: Custom instructions allow teams to encode their specific practices, internal libraries, and coding standards

## MCP Servers

### **MCP Server install and config**

If you are wanting to show MCP server integration, you will need to set up and configure the MCP servers _prior_ to the demo. I have included the necessary `mcp` config in the [mcp.json](../.vscode/mcp.json) file. Open the file and use the HUD display above the servers to start them:

![VS Code MCP server configuration showing playwright and github servers with Start buttons](./mcp.png)

You can also use the Command Palette to start the MCP servers.

> [!NOTE]
> There are 2 GitHub MCP server: `github-local` and `github-remote`. The local server runs off `docker` (you may want to change this to `podman` if you have Podman installed). This will prompt for a PAT. The remote server connects to the Remote MCP server and uses OAuth to authenticate. **Start one or the other, not both**!

#### Start the Playwright MCP Server

- Use the cmd palette `Cmd/Ctrl + Shift + P` -> `MCP: List servers` -> `playwright` -> `Start server`

#### Start the GitHub MCP Server

> [!IMPORTANT]
> Generate a fine-grained PAT that has permissions to read/write Issues and PRs, context and whatever other features you want to demo. You can create this at the org/repo level. I suggest creating a PAT and storing it in a key vault (or 1Password) so that you have it handy.

- This server runs via Docker image, so you will need Docker to be installed and running before starting this server. I use Podman on my Mac.
- Use the cmd palette `Cmd/Ctrl + Shift + P` -> `MCP: List servers` -> `github` -> `Start server`. The first time you run this, you will have to supply a PAT.

> **Pro tip:** If you want to change the PAT, open the Settings json file. You will see `"id": "github_token" = ****` in the `input` section. Right-click on the `***` section to edit or clear the cached token. (The `***` is a GUI feature - the value is not actually stored in the json file)

### Demo: MCP Servers - Playwright  

- **What to show:** Launch browser navigation using Playwright MCP server to show functional testing from natural language, plus demonstrate feature file generation with custom prompts.
- **Why:** Demonstrate support for extending Copilot capabilities using MCP server protocol and how custom prompts can standardize testing practices.
- **Part 1 - Custom BDD Mode:**
  1. Switch to `BDD` mode.
  2. Run the prompt `add a feature to test the cart icon and page` to generate comprehensive Gherkin feature files for Cart functionality
  3. Show the generated behavioral test scenarios

- **(Optional) Part 2 - Playwright MCP:**
  1. Ask Copilot to `browse to http://localhost:5137 and execute the test steps`
  2. Accept the Playwright command requests and show Copilot "running" the test.
  3. (Optional): Ask Copilot `to generate headless Playwright tests for the .feature file`

- **Key Takeaway**: MCP servers extend Copilot's capabilities while custom prompts can standardize testing approaches across teams.

### Demo: MCP Servers - GitHub

- **What to show:** Interact with GitHub from Chat.
- **Why:** Demonstrate support for extending Copilot capabilities using MCP server protocol as well as the GitHub MCP server.
- **How:**  
  1. Switch to Agent mode
  2. Ask Copilot to `check which issues are assigned to me in the repo`.
  3. Show how Copilot fetched issues (or shows there are no issues)
  4. Ask Copilot to `create an Issue for enhancing test coverage in the API project and assign it to me`. (Don't forget to check the owner/repo in the args!)
  5. Show how Copilot creates a new Issue with a meaningful description and labels
  6. (Optional): Assign the issue to Copilot to queue off Copilot Coding Agent!

## Security

### Demo: Copilot and Application Security

- **What to show:** Copilot's ability to understand and remediate security vulnerabilities
- **Why:** Demonstrate that Copilot can be used to scale AppSec by bringing security expertise to Developers directly.
- **How:**  
  1. Open Copilot Chat and switch to `Ask` mode.
  2. Ask Copilot to `analyze @workspace and check if there are obvious security vulnerabilities`
  3. You should see issues like:
      - Cross-site Scripting (XSS) vulnerability
      - Command Injection Vulnerability
      - Insecure CORS Configuration
      - Missing Security Headers
      - Insecure Authentication Implementation
  4. Chat with Copilot to address one of these issues: `generate a fix for ...`
  5. (Optional with GitHub MCP Server): Ask Copilot to `create an issue to fix ...` and select a vulnerability for Copilot to create an Issue

## CI/CD

### Demo: Automating Deployment with GitHub Actions, Azure and Bicep

- **What to show:** Copilot generating Actions workflows and Infrastructure-as-code.
- **Why:** Show Copilot's ability to automate CI/CD workflows.
- **How:**
  1. Ensure that you have run the [configure-deployment.sh](../infra/configure-deployment.sh) script to set up the initial infrastructure and configure the environments and vars in the repo.
  2. Add the [deployment.md](../docs/deployment.md) file as context.
  3. Prompt Copilot Agent to `generate bicep files and workflows according to the deployment plan`
  4. Show generated files:
     - GitHub Actions YAML to build & test
     - GitHub Actions YAML to deploy including an approval step
  5. Accept the changes
  6. Commit and push to see the pipeline execution
  7. Show the deployment

## Copilot Coding Agent

### Demo: Using `/handoff` Custom Prompt for Session Management

- **What to show:** Using the custom `/handoff` prompt to hand off Ask/Agent work to another session with proper context preservation.
- **Why:** Demonstrate how custom prompts can control context, drop unnecessary information, and efficiently hand off work between Chat/Agent sessions or team members.
- **How:**  
  1. Open Copilot Chat and switch to `Plan` mode.
  2. Enter `I want to add Personal Profile page to the app that shows the user profile and their purchases.`
  3. Show the output and ask Copilot to change something in the plan: for example, remove the `purchases` part
  4. **Explain the Context Problem**: Currently the entire conversation is in the context, which over time grows long and can consume too much of the context window. Custom prompts can solve this by creating clean handoffs.
  5. **Show the Custom Prompt**: Open the [handoff.prompt.md](../.github/prompts/handoff.prompt.md) file in the prompts directory. Point out:
     - The YAML frontmatter configuring it as an Agent mode prompt
     - The internal thinking process in HTML comments (not shown to user)
     - The structured template for consistent handoffs
  6. **Run the Prompt**: Click the "Run" button, use Command Palette → "Prompts: Run Prompt" or type `/handoff` in the chat to execute the handoff prompt
  7. **Show Results**: Display the generated `handoff.md` document. It should contain:
     - Clean summary without noise from the conversation
     - Gathered information and requirements
     - The refined plan (without the removed `purchases` part)
     - Next actions for the receiving developer
  8. **Complete the Handoff**: Switch to `Agent` mode, include the handoff document as context, and ask Copilot to `implement the changes according to the handoff document`. You can cancel after a few seconds since you don't need to show the entire implementation.
  9. **Best Practices**: Explain that custom handoff prompts are valuable for:
     - Context size management
     - Clean knowledge transfer between sessions
     - Team collaboration and handoffs
     - Preserving important decisions while removing noise
  10. **Cleanup**: You can revert the changes to the `handoff.md` file after the demo.

### Demo: Using `/handoff-to-copilot-coding-agent` Custom Prompt for Async Session Continuation

- **What to show:** Using the custom `/handoff-to-copilot-coding-agent` prompt to hand off current plan work to GitHub Copilot Coding Agent with proper context preservation.
- **Why:** Demonstrate how custom prompts can encapsulate IDE tools and MCP tools calls into a cohesive workflow.

- **How:**  
  1. Make sure that you have Remote GitHub MCP Server running.
  2. Open Copilot Chat and switch to `Plan` Chat Mode.
  3. Enter `I want to add Personal Profile page to the app that shows the user profile and their purchases.`
  4. Show the output and ask Copilot to change something in the plan: for example, remove the `purchases` part
  5. **Explain Time Constraints**: We have a detailed plan now, Copilot Agent can follow it and implement the desired feature, however, in order to use our time efficiently we can hand off the implementation to the Copilot Agent, allowing us to focus on other tasks (or showing other copilot features in this demo).
  6. **Show the Custom Prompt**: Open the [handoff-to-copilot-coding-agent.prompt.md](../.github/prompts/handoff-to-copilot-coding-agent.prompt.md) file in the prompts directory. Point out:
     - The YAML frontmatter configuring it as an Agent mode prompt
     - The internal thinking process in HTML comments (not shown to user)
     - The structured issue template for consistent handoffs
     - Use of tools like `changes`, `create_issue`, and `assign_copilot_to_issue`.
     - Show how to configure the tools (click 'Configure Tools' link above `tools: []` line)
  7. **Run the Prompt**:
      - _Important_ We're in the 'Plan' Chat Mode now, and it has a limited set of tools available. We need to switch to `Agent` mode to use /handoff-to-copilot-coding-agent prompt. At the moment we cannot force switch the mode.
      - Click the "Run" button, use Command Palette → "Prompts: Run Prompt" or type `/handoff-to-copilot-coding-agent` to execute the handoff prompt
  8. **Show Results**: Display the generated output, it should contain a call to GitHub MCP and a short summary with the Issue link.
     - Clean summary without noise from the conversation
     - Gathered information and requirements
     - The refined plan (without the removed `purchases` part)
  
      Open GitHub repository and how the new issue. Demonstate that it's been assigned to GitHub Copilot Coding Agent and it started the session.
  9. **Complete the Handoff**: You can now stop the session if you don't need this implementation for your demo.
  10. **Best Practices**: Explain that custom prompts are valuable for:
  - Codifying repetitive parts of existing workflows
  - Improving the discoverability of available Copilot use cases

### Demo: Using Copilot to help you help Copilot (inception)

- **What to show:** Using a Chat Mode to help you refine your prompt, including a clarity score
- **Why**: Helping users clarify their prompts is key to getting good results: but most developers don't know how to improve their prompts. This custom Chat Mode helps to improve prompts.
- **How:**
  1. Select "RefinePrompt" in the Chat mode
  2. Enter a vague prompt: `I want a Cart page`. The output should ask some clarifying questions and have a low clarity score.
  3. Attach the [cart image](docs/design/cart.png) to the Chat.
  4. Enter a more detailed prompt: `I want a cart Page that shows the items in the cart currently using the attached image for design elements. Match dark/light modes. Show a shipping fee of $25 but free for orders over $150. Add a cart icon to the NavBar that shows the number of items in the cart and updates when items are added/removed. When the icon is clicked, navigate to the Cart page.`
  5. You should get an even better prompt back with a high clarity score.

### Demo: Using Copilot Coding Agent to Experiment in Parallel

- **What to show:** Creating 3 variations of the Cart page in parallel.
- **Why:** Experimentation can be time-consuming and costly - unless you get Copilot Coding Agent to do it for you - in parallel! Then you can choose the option you like the best.
- **How:**  
  1. Make sure you have the GitHub Remote MCP server running
  2. Run the `demo-cca-parallel` prompt using the Command Palette
  3. **Note**: This takes a couple minutes to create the Issues and then Copilot Coding Agent takes about 20 minutes to complete the code changes, so be prepared for other demos or do this before your live demo and just show the results.

### Demo: Self-healing DevOps

- **What to show:** Copilot Coding Agent can self-heal failing Actions workflows.
- **Why:** Many times failing CI/CD pipelines can be fixed by simple changes - this demo shows how you can use GitHub Copilot (via the [ai-inference Action](https://github.com/actions/ai-inference)) to self-heal failing jobs.
- **How:**  
  1. You will need to generate a PAT since the prompt for analyzing the failed job uses MCP. Navigate to your GitHub Developer Settings and generate a Fine-grained token with the following permissions:
     1. Org level: `Models` read-only
     2. Repo level: `Actions` read-only, `Contents` read-only, `Issues` read/write
  2. In the repo, navigate to Settings and add a new Actions repository secret called `AUTO_REMEDIATION_PAT` with your PAT
  3. Enable the Action `Auto Analyze Build Failures`
  4. Apply the Patch Set `Copilot: Self-Healing DevOps`[^1], which will create an error in the code
  5. Commit and push
  6. This will trigger the `ci` workflow, which will fail
  7. The failure in turn triggers the `auto-analyze-failures` workflow, which will analyze the build failure, create an Issue and assign it to Copilot
  8. Copilot Coding Agent will create the PR to fix the issue by reverting the line that broke the test
  9. **Note**: This whole workflow takes a few minutes, so if you're going to show this, you may want to run this before your demo.
  10. The [failed-run-analyze.prompt.yml](.github/models/failed-run-analyze.prompt.yml) file contains the prompt used in the workflow to analyze the build failure. You can open this in the Models tab in the repo, but it requires MCP so you won't be able to test it fully in Models.

## Summary: Key Takeaways for Customers

- **Custom Prompts**: Reusable prompts with YAML frontmatter enable consistent, repeatable workflows and can encapsulate complex multi-step processes
- **Agent Mode**: Handles multi-step changes across multiple files — saving time and reducing context switching
- **Vision Integration**: Enables Copilot to understand images, designs, and visual requirements for more intuitive development
- **Command Execution**: Allows Copilot to self-heal by running tests, validating changes, and iterating on solutions
- **MCP Protocol**: Extends Copilot with additional capabilities (gracefully handles credentials without hard-coding tokens!)
- **Custom Instructions**: Repository-level configuration allows teams to encode their specific practices, internal libraries, and coding standards
- **Testing Automation**: Custom prompts can standardize testing practices and ensure comprehensive coverage automatically
- **Security Integration**: Built-in security analysis and remediation capabilities help scale AppSec practices across development teams

---------

[^1]: To learn how to apply a patch-set, see [patch-sets.md](patch-sets.md)
