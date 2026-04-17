// lib/quotes.ts

export async function getLiveQuote() {
    try {
        /**
         * next: { revalidate: 86400 } tells Next.js to 
         * cache this quote for 24 hours (86,400 seconds).
         */
        const response = await fetch("https://zenquotes.io/api/random", {
            next: { revalidate: 86400 }
        });

        const data = await response.json();

        return {
            text: data[0].q,
            author: data[0].a
        };
    } catch (error) {
        // If the internet or API is down, show this fallback quote
        return {
            text: "Art is the journey of a free soul.",
            author: "Artrese"
        };
    }
}