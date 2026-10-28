# dinerismail.dev

My personal site, built with [TanStack Start](https://tanstack.com/start) and deployed on Netlify.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run preview  # serve the production build
```

```bash
npm run format   # Prettier
npm run lint     # oxlint
npm run check    # oxlint + type check
```

Content lives in `content/`: `posts/`, `links/` and `books/` (book reviews).

For notes on TanStack Router, data loading, Query, Store and shadcn, see [docs/tanstack-reference.md](docs/tanstack-reference.md).

## Book highlights

Two scripts export my book highlights to markdown, one file per book, to help with writing book reviews. Both write to `highlights/`, which is gitignored:

- `highlights/<book>.md` for books without a review yet
- `highlights/published/<book>.md` for books that already have a review in `content/books/`. When a review is added, the next export moves the book's file here.

Each file has the title and author in front matter, then the highlights as quotes with any notes underneath.

Both scripts take the same options:

| Option          | Default      | Description                                   |
| --------------- | ------------ | --------------------------------------------- |
| `--book <term>` |              | Only export books whose title or slug matches |
| `--out <dir>`   | `highlights` | Where to write the files                      |

To skip books for good, add part of the title or the slug to the script's ignore file, one per line (`#` starts a comment).

If a book is in both Kindle and Play Books under the same title, whichever export runs last overwrites the other.

### Kindle

```bash
npm run highlights
npm run highlights -- --book "you are here"
```

Plug the Kindle in over USB first. The script reads `My Clippings.txt` from the device, which includes highlights from sideloaded and Send to Kindle books that Amazon's online notebook doesn't show. If the Kindle isn't mounted at `/Volumes/Kindle`, pass `--clippings <path>` with the path to `My Clippings.txt`.

- Ignore file: `scripts/kindle-highlights-ignore.txt`
- If macOS refuses access, allow your terminal under System Settings → Privacy & Security → Files & Folders → Removable Volumes, then restart the terminal.

### Google Play Books

```bash
npm run highlights:play-books
npm run highlights:play-books -- --book "mate"
```

With **Save notes, highlights and bookmarks in Google Drive** turned on in the Play Books settings, Play Books keeps a Google Doc per book (`Notes from "<title>"`) in a `Play Books Notes` folder on Drive. The script reads those docs through the Google Drive and Docs APIs. The `.gdoc` files that Drive for desktop syncs only contain a link to each doc, not the highlights.

- Ignore file: `scripts/play-books-highlights-ignore.txt`. Use this instead of deleting a book's `.gdoc` file, which deletes the doc on Drive.
- `--folder <name>` reads a folder with another name (default `Play Books Notes`).
- `--credentials <path>` uses OAuth client credentials from somewhere else (default `~/.config/play-books-highlights/credentials.json`).

#### One-time setup

Do these steps in the Google Cloud Console while signed in to the Google account that owns the Play Books notes:

1. [Create a project](https://console.cloud.google.com/projectcreate).
2. Enable the [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) and the [Google Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com).
3. In [Google Auth Platform](https://console.cloud.google.com/auth/overview), set up the consent screen with audience **External**, then add your account under **Audience → Test users**.
4. [Create an OAuth client](https://console.cloud.google.com/auth/clients) of type **Desktop app** and download its JSON:
   ```bash
   mkdir -p ~/.config/play-books-highlights
   mv ~/Downloads/client_secret_*.json ~/.config/play-books-highlights/credentials.json
   ```

The first run opens the browser to sign in. Google warns that the app isn't verified; it's your own app, so continue. The script asks for read-only access to your Drive and saves the sign-in to `~/.config/play-books-highlights/token.json`. While the app is in Testing mode, Google expires the sign-in after 7 days and the browser opens again on the next run.
