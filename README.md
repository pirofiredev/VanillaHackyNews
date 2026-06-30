### I'm archiving this version of HN, because:

1. Every API fetch is happening on client side (**no SSR**)
2. There's no way to handle protected API keys on client-side for juni AI and supabase
3. It's hard to guess how JS will behave with variables without static typing
4. Adjusting infrastructure is hard, because I want to add extra "layer" to ycombinator's HN (registering, commenting... user interaction interdependent from that old 2015 ahh UI)
5. I've reached state that I fixed my most important JS knowledge, and every new HN feature without frameworks feels like a *patch on patch*.

---

#### The new version is here: https://github.com/pirofiredev/amberglow
