# Fawna — Progress

Last updated: 2026-10-20

## What Fawna does right now

1. A parent picks a photo of a worksheet.
2. The browser checks it's a picture (PNG, JPEG or WebP) and not too big.
3. The browser **shrinks** the photo and shows a preview.
4. The parent clicks **Analyze** and the photo is sent to our server.
5. The server checks the photo again and gets it ready for the AI.
6. The server replies "received", and the page shows that message.

The AI isn't switched on yet. The code to call it is written but turned off.

## Done ✅

| What | Where | Tested? |
|---|---|---|
| Upload a photo and see a preview | `ImageUpload.tsx` | Yes, by hand |
| Check the photo in the browser | `ImageUpload.tsx` | Yes, by hand |
| Check the photo again on the server | `route.ts` | Yes, by hand |
| Turn the photo into text (base64) for the AI | `route.ts` | Runs, but the AI call is off |
| Shrink the photo in the browser | `lib/image/shrinkImage.ts` | **Yes, with a real iPhone photo** |
| Write down our decisions | `docs/decisions.md` | — |

## The shrinking test

A real upright iPhone photo of a worksheet:

- **Before:** 4.2 MB
- **After:** 260 KB (about 94% smaller)
- **Still upright?** Yes
- **Is the small print readable?** Not checked properly yet. We'll know once the AI is switched on.

## What we learned

- **Base64** writes the same photo out as text. It's about a third bigger, and it removes nothing.
- **AI models shrink big photos anyway**, so sending a huge photo wastes time.
- **Phone photos hide extra information**, like where they were taken. Redrawing the photo removes it.
- **Phones store photos sideways** and add a note saying which way is up.
- **An `async` function always returns a Promise.** Use `await` to get the real value.
- **Catch errors only where you can do something about them**, like showing the parent a message.
- **A `blob:` link** points to a file in the browser's memory. It only works on that page while it's open.

## Not done yet ⏳

- [ ] **Server:** turn the photo upright, remove the hidden information and shrink it, using sharp
- [ ] Switch on the AI call and send the result back to the page
- [ ] Make the size limit smaller (it's still 10 MB)
- [ ] Fix the preview looking stretched (`cover` → `object-contain`)
- [ ] Check the small print is readable once the AI is on
- [ ] Update decision ADR-004 to say "browser **and** server"
- [ ] Small server fixes: an unfinished error message, a check that never runs, and the wrong error code when something breaks
- [ ] Commit this work (nothing since 2026-09-11 is committed yet)

## Later

- Parents log in
- iPhone HEIC photos uploaded from a Mac are rejected. Decide what to do.
- Automated tests
