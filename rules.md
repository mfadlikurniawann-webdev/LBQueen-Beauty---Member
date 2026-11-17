# AI Agent Rules for LBQueen POS

## UI/UX Rules
1. **Consistency**: All buttons must have the same style (rounded-2xl, font-bold, specific padding).
2. **Responsiveness**: 
   - Tables must be responsive. Use a card layout for screen sizes smaller than `md`.
   - Never allow content to be cut off on mobile devices.
3. **No Emojis**: Do not use emojis in any part of the UI.
4. **Premium Feel**: Use gradients, backdrop blurs, and consistent rounded corners (32px for containers, 16px-20px for components).

## Code Quality Rules
1. **No Unnecessary Comments**: Do not add `#komen` or any verbose comments that don't add value.
2. **Server-side Data Operations**: 
   - All filtering, searching, and pagination must be handled by the backend (Supabase) using `.range()`, `.ilike()`, etc.
   - Do not filter large datasets on the client side.
3. **Standardized Responses**: 
   - Implement a consistent way to handle API responses (Get, Post, Put, Delete).
   - Use try-catch blocks and provide user-friendly toast notifications.
4. **Security**: Ensure all queries are safe from SQL injection by using the Supabase client properly.

## Export Rules
1. **Excel/PDF Styling**:
   - Use proper headers, colors, and formatting for exported files.
   - PDF should look professional with the LBQueen branding (colors and logo-like text).
   - Excel should have formatted columns and bold headers.

## Documentation Rules
1. Always update `claude.md` if significant architectural changes are made.
2. Refer to these rules for every code modification.
