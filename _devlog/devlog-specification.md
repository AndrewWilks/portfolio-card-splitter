# Dev Log Specification

## Overview

This specification ensures consistency across all dev log entries for the
Portfolio Card Splitter project. Dev logs serve as both personal documentation
and educational content for other developers viewing my GitHub portfolio.

## Writing Guidelines

### Tone & Voice

- **Conversational & Friendly**: Write like you're chatting with a fellow
  developer over coffee
- **Educational Twist**: Explain technical concepts naturally, not lecture-style
- **Authentic**: Share real struggles, decisions, and "aha!" moments
- **Encouraging**: Show that learning and growth happen through iteration

### Structure Template

```markdown
# [Date] - [Descriptive Title]

## 🎯 What I Accomplished

[Storytelling summary of progress]

## 🏗️ Technical Deep Dive

[Educational explanations of architecture/decisions]

## 💡 Key Learning's

[Lessons learned, challenges overcome]

## 🚀 What's Next

[Roadmap and immediate priorities]

## 📸 Visual Progress

[Screenshot descriptions with alt tags]

## 🔗 Resources & References

[Links to docs, articles, or related work]
```

### Content Rules

- **Length**: 800-1200 words (detailed but focused)
- **Storytelling**: Frame technical work as a journey with challenges and
  victories
- **Educational Value**: Explain "why" behind technical choices
- **Honesty**: Include mistakes, wrong turns, and how they were corrected
- **Future-Focused**: Always end with what's next and why it matters

### File Naming Convention

```text
YYYY-MM-DD-[descriptive-title].md
```

Examples:

- `2025-10-21-project-scaffolding-complete.md`
- `2025-10-28-authentication-implementation.md`
- `2025-11-05-real-time-features.md`

### Media Guidelines

#### Screenshots Location

```text
_devlog/assets/
├── YYYY-MM-DD-[title]/
│   ├── screenshot-01.png
│   ├── screenshot-02.png
│   └── diagram-01.png
```

#### Alt Tags Format

```html
alt="Screenshot showing [what's displayed] in [context], demonstrating [key
point]"
```

#### When to Include Media

- **Architecture Diagrams**: Clean architecture layers, data flow
- **Code Structure**: Directory trees, file organization
- **UI Progress**: Component layouts, user flows
- **Test Results**: Coverage reports, passing tests
- **Database Schema**: ER diagrams, table relationships
- **API Documentation**: Endpoint examples, request/response

#### Media Descriptions

Always include in the log:

```markdown
![Architecture Overview](assets/YYYY-MM-DD-title/architecture-diagram.png)
_Figure 1: Clean Architecture layers showing separation of concerns between
entities, repositories, services, and routes_
```

### Technical Standards

#### Code Examples

- Use syntax highlighting: ```typescript
- Keep examples concise and focused
- Explain complex logic in comments
- Link to full implementations in repo

#### Terminology

- **Explain Jargon**: Define terms on first use
- **Consistent Naming**: Use project-specific terms consistently
- **Acronyms**: Spell out on first use (TDD, SOLID, OOP)

### Quality Checklist

- [ ] Storytelling flow (beginning, middle, end)
- [ ] Educational value (explains concepts)
- [ ] Technical accuracy
- [ ] Appropriate length
- [ ] Media properly described
- [ ] Future-focused conclusion
- [ ] Grammar and readability checked

### Publishing Guidelines

- **Platform**: GitHub repository and personal portfolio
- **SEO**: Include relevant keywords naturally
- **Accessibility**: Alt tags, semantic HTML
- **Cross-linking**: Reference previous/future logs
- **Updates**: Note if content is updated after publication

### Evolution

This specification can evolve as the project progresses. Document changes in
future dev logs when significant updates are made.
