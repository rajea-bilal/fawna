# Fawna — Progress

Last updated: 2026-10-21

## What Fawna does right now

1. A parent picks a photo of a worksheet.
2. The browser checks it's a picture (PNG, JPEG or WebP) and not too big.
3. The browser **shrinks** the photo and shows a preview of the whole page.
4. The parent clicks **Analyze** and the photo is sent to our server.
5. The server checks it again, **shrinks it again** with sharp (a safety net), and turns it into base64.
6. The server replies "received", and the page shows that message.

The AI isn't switched on yet. The code to call it is written but turned off.

## Done ✅

| What | Where | Tested? |
|---|---|---|
| Upload a photo and see a preview | `ImageUpload.tsx` | Yes, by hand |
| Check the photo in the browser and on the server | `ImageUpload.tsx`, `route.ts` | Yes, by hand |
| Shrink the photo in the browser | `lib/image/shrinkImage.ts` | Yes, with a real iPhone photo |
| Shrink the photo on the server (sharp) | `lib/image/processImageOnServer.ts` | Yes, with a real iPhone photo |
| Shared settings (1600 px, quality 0.8) | `lib/image/imageSettings.ts` | — |
| Turn the photo into base64 for the AI | `route.ts` | Runs, but the AI call is off |
| Preview shows the whole page (`object-contain`) | `ImageUpload.tsx` | Yes, by hand |
| Decisions and test write-up | `docs/decisions.md`, `docs/process.md` | — |

## Shrinking test (details in `docs/process.md`)

- **Browser:** 4.2 MB → 260 KB (about 94% smaller)
- **Server:** 259,798 → 259,252 bytes (barely changes, as expected)
- **Hidden data removed on the server:** yes. The data sections were gone from the file.

## What we learned

- **Base64** writes the same photo out as text. It's about a third bigger, and it removes nothing.
- **AI models shrink big photos anyway**, so sending a huge photo wastes time.
- **Phone photos hide extra data**, like location. Redrawing or re-saving the photo removes it.
- **Browser code can't run on the server.** No `document` or canvas, so the server uses sharp.
- **An `async` function always returns a Promise.** Use `await` to get the real value.
- **Catch errors only where you can do something about them.**
- **Check first, process after.** Don't do expensive work on a file you'll reject.

## Not done yet ⏳

- [ ] **Switch on the AI call** and send the result back to the page (next)
- [ ] Check the AI can read the small print
- [ ] Prove upright photos are handled (check the original photo's rotation note)
- [ ] Make the size limit smaller (still 10 MB)
- [ ] Update ADR-004 to say "browser **and** server"
- [ ] Finish the 415 error message (it just says "File type ")
- [ ] Error codes: use 4xx for bad images and 5xx for server faults (the catch always sends 400)
- [ ] Remove debug `console.log`s
- [ ] Free old preview links with `URL.revokeObjectURL`

## Later

- Parents log in
- iPhone HEIC photos uploaded from a Mac are rejected. Decide what to do.
- Automated tests
