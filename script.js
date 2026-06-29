setTimeout(() => {
    window.location.reload();
}, 600000); // refresh every 10 mins

// cookie part
if(document.cookie === "") {
    // triggers to load content from network
    console.log("welcome first time!");

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("#refreshButton").click();
    });
}
else {
    // triggers to load content from local device
    // pull data

    const tempDataArr = JSON.parse(localStorage.getItem("preloadedPages") || "[]");

    // if layer to prevent unloaded corrupted arr and user without content 👌
    if(tempDataArr === "") {
        console.log("corrupted");

        document.addEventListener("DOMContentLoaded", () => {
            document.querySelector("#refreshButton").click();
        });

    }
    else {
        const postsContainer = document.getElementById("posts");

        tempDataArr.forEach(post => {
            postsContainer.innerHTML += post;
        });

        document.getElementById("posts").classList.remove("hidden");
        document.getElementById("posts").classList.add("flex");

        document.getElementById("loading-posts").classList.add("hidden");
        document.getElementById("loading-posts").classList.remove("flex");
    }
}

// document.cookie = "isUpToDate=true; max-age=600"; // 10 mins



// refresh button animation + action

document.querySelector("#refreshButton").addEventListener("click",async ()=> {
    const refreshArrow = document.querySelector("#refreshArrow");
    const refreshBtn = document.querySelector("#refreshButton");

    // arrow spin animation
    refreshArrow.classList.add("animate-spin");

    // disable when fetch in progress
    refreshBtn.classList.add("cursor-not-allowed");
    refreshBtn.classList.add("bg-(--color-surface2)");
    refreshBtn.classList.remove("cursor-pointer");
    refreshBtn.classList.remove("hover:bg-(--color-surface)")

    refreshBtn.disabled = true;


    const success = await getPosts();


    setTimeout(() => {
        if(success === true) {
            // stopping animation
            refreshArrow.classList.remove("animate-spin");

            // enable button
            refreshBtn.classList.add("cursor-pointer");
            refreshBtn.classList.add("hover:bg-(--color-surface)")
            refreshBtn.classList.remove("bg-(--color-surface2)");
            refreshBtn.classList.remove("cursor-not-allowed");
            refreshBtn.disabled = false;

        }
    }, 500);

});


function test(postClickedId) {

}

// returns first 200 chars from url for preview
async function getPostContent(postUrl) {

    const jinaUrl = "https://r.jina.ai/";

    const jinaRawResult = await fetch(jinaUrl + "/" + postUrl, {
        //! WARN there's no way to pass ENV without exposing it in client-side, the solution
        //! WARN is to use any cloud-based framework, like node.js. But this is a vanilla thingy.

        headers: { Accept: "application/json", Authorization: `Bearer ${process.env.JINA_AI_API_KEY}` },
    });

    const result = await jinaRawResult.json();

    if(result.code === 200) {
        return result.data.description.slice(0, 200) + " ...";
    }
    else if(result.code === 451) {
        return "Preview unavailable due to legal reasons :(";
    }
    else {
        return "Preview unavailable";
    }

}


async function getPosts() {

    const mostPopularPostsUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
    
    function itemUrl(itemId) {
        return `https://hacker-news.firebaseio.com/v0/item/${itemId}.json`;
    }

    function timeAgo(unixTime) {
        const diff = Math.floor((Date.now() - unixTime * 1000) / 1000);

        if (diff < 60)    return `${diff} seconds ago`;
        if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }


    function createPost(post, postCount, postContent, loadFrom, loadTo) {

        const postPublishedAgo = timeAgo(post.time);

        let commentsCount = 0;

        if(post.kids !== undefined) {
            commentsCount = post.kids.length - 1;
        }

        // domain parser
        function getDomainFromUrl(url) {
            const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i;
            const match = url.match(regex);
            return match ? match[1] : null; // Return the domain if found
        }

        return `
                <div class="post bg-(--color-surface) border-sm normalBorder p-5 flex">

                    <div class="rating flex flex-col items-center">

                        <svg class="cursor-pointer text-(--color-text-normal) hover:text-green-500 transition" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13v-1h6V6h1v6h6v1h-6v6h-1v-6z"></path></svg>
                        <p class="mt-1 mb-0.5 text-sm">${post.score}</p>
                        <svg class="cursor-pointer text-(--color-text-normal) hover:text-red-500 transition" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13v-1h13v1z"></path></svg>
                       
                    </div>

                    <div class="centerPostContainer flex flex-col ml-5 mr-auto">
                        <p class="postNumberId font-mono text-sm text-(--color-text-darkest)">${postCount}</p>

                        <div class="flex flex-row gap-2 items-center">
                            <p class="postTitle text-lg text-(--color-text-normal)">${post.title}</p>
                            <a href="${post.url}" class="postSource text-sm text-(--color-text-darkest)" target="_blank">(${getDomainFromUrl(post.url)})</a>
                        </div>

                        <div class="flex flex-row text-sm gap-1 text-(--color-text-darkest) mb-1">     <!-- done trick with many nested <p>'s to make fading effect only on ? chars -->
                            <p class="postAuthor">by <b class="text-(--color-main-orange)">${post.by}</b> ·</p>
                            <p class="postAuthor">???</p><p>reactions ·</p>
                            <p class="postAuthor">${postPublishedAgo}</p>
                        </div>

                        <div class="flex flex-row gap-3 items-center">
                        
                                <span class="flex flex-row gap-2 items-center">
                                    <svg class="text-(--color-text-normal)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4.586l-2.707 2.707a1 1 0 0 1-1.414 0L8.586 19H4a2 2 0 0 1-2-2zm18 0H4v11h5a1 1 0 0 1 .707.293L12 19.586l2.293-2.293A1 1 0 0 1 15 17h5zM6 9.5a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1m0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1"></path></svg>
                                    <p class="commentsQuantity text-sm text-(--color-text-normal)">${commentsCount}</p>                       
                                </span>

                                <p class="commentsQuantity text-sm text-(--color-text-darkest)">last message in thread: <i>?</i> h ago</p>
                                
                                <div id="expandBtn${postCount}" class="flex flex-row items-center normalBorder py-1 px-2 gap-1 font-mono ml-auto hover:bg-(--color-surface2) cursor-pointer" onclick="test(${post.id})">
                                    <svg class="text-(--color-text-darkest) cursor-pointer" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="10" height="10" viewBox="0 0 24 24"><g transform="rotate(180 12 12)"><path fill="currentColor" d="m21.9 19.3l-9-15.6l-.3-.3c-.5-.3-1.1-.2-1.4.3l-9 15.6c-.2.1-.2.3-.2.5c0 .6.4 1 1 1h18c.2 0 .3 0 .5-.1c.5-.3.6-.9.4-1.4"></path></g></svg>
                                    <input type="button" value="expand" class="text-(--color-text-darkest) text-[0.8em] cursor-pointer">
                                </div>
                                

                            
                        </div>
                        
                        <div class="expansion-container mt-1">
                            <div class="expansion-card-container flex flex-col">
                                <a href="${post.url}" class="text-(--color-text-darkest) text-[12px] font-mono cursor-pointer" target="_blank">${post.url}</a>
                                <p class="text-(--color-text-normal) text-sm">${postContent}</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
        `;
    }
    
    try {
        const response = await fetch(mostPopularPostsUrl);

        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        else {
            const data = await response.json();
            console.log(data);

            // after successful 500 ids pull, clean all and then output first 10 titles
            document.getElementById("posts").innerHTML = "";

            let tempLocalPostsArr = [];
            localStorage.removeItem("preloadedPages");


            // declaration range of loaded posts TEMP
            
            const loadFrom = 0;
            const loadTo = 10;
            
            for(let i=loadFrom; i<=loadTo; i++) {
                const storyResponse = await fetch(itemUrl(data[i]));

                if(storyResponse.ok) {
                    const storyData = await storyResponse.json();

                    document.getElementById("loading-posts").classList.add("hidden");
                    document.getElementById("loading-posts").classList.remove("flex");

                    // first 6 sentences from jina API
                    // const storyContent = getPostContent(storyData.url)

                    const storyContent = await getPostContent(storyData.url);

                    // creates posts which has passed - data, number of post(iteration), loadFrom and loadTo
                    const currentPost = createPost(storyData, i + ".", storyContent, loadFrom, loadTo);

                    // insert into HTML
                    document.getElementById("posts").innerHTML += currentPost;
                    
                    // load it into mem
                    tempLocalPostsArr.push(currentPost);

                }
                document.getElementById("posts").classList.remove("hidden");
                document.getElementById("posts").classList.add("flex");
            }

            // put into mem before exiting
            localStorage.setItem("preloadedPages", JSON.stringify(tempLocalPostsArr));

            return true;
        }
    }
    catch(error) {
        console.log(error);
        return false;
    }
}


// theme dark / white toggle part
document.querySelector("#themeToggle").addEventListener("click",()=>{

    const currentBtnEmoji = document.querySelector("#themeToggle").value;

    if (currentBtnEmoji === "☀️") {
        document.querySelector("#themeToggle").value = "🌙";

        document.documentElement.style.setProperty('--color-bg-logo',           '#ffe8d6');
        document.documentElement.style.setProperty('--color-text-normal',       '#000000');
        
        document.documentElement.style.setProperty('--color-main-bg',           '#f6f6ef');
        document.documentElement.style.setProperty('--color-main-orange',       '#ff6600');
        document.documentElement.style.setProperty('--color-darker-orange',     '#cc5200');
        document.documentElement.style.setProperty('--color-transparent-orange','#ffe8d6');
        document.documentElement.style.setProperty('--color-surface',           '#ffffff');
        document.documentElement.style.setProperty('--color-surface2',          '#f0ede6');
        document.documentElement.style.setProperty('--border',                  '#d8d5ce');
    } 
    else {
        document.querySelector("#themeToggle").value = "☀️";

        document.documentElement.style.setProperty('--color-bg-logo',           '#2e2012');
        document.documentElement.style.setProperty('--color-text-normal',       '#ffffff');

        document.documentElement.style.setProperty('--color-main-bg',           '#0f0f0f');
        document.documentElement.style.setProperty('--color-main-orange',       '#ff6600');
        document.documentElement.style.setProperty('--color-darker-orange',     '#9a3e00');
        document.documentElement.style.setProperty('--color-transparent-orange','#2a1a0a');
        document.documentElement.style.setProperty('--color-surface',           '#161616');
        document.documentElement.style.setProperty('--color-surface2',          '#1e1e1e');
        document.documentElement.style.setProperty('--border',                  '#2a2a2a');
    }
});