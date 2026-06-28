// declaration range of loaded posts

const loadFrom = 0;
const loadTo = 20;



// cookie part
if(document.cookie == "") {
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
    if(tempDataArr == "") {
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
        document.getElementById("loading-posts").classList.add("hidden");
        document.getElementById("loading-posts").classList.remove("flex");
    }
}

document.cookie = "isUpToDate=true; max-age=10";



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
        if(success == true) {
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

    function createPost(post, postCount, loadFrom, loadTo) {

        const postPublishedAgo = timeAgo(post.time);

        let commentsCount = 0;

        if(post.kids != undefined) {
            commentsCount = post.kids.length - 1;
        }



        return `
                <div class="loadingPost bg-(--color-surface) border-sm normalBorder p-5 flex">

                    <div class="rating flex flex-col items-center">

                        <svg class="cursor-pointer text-white hover:text-green-500 transition" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" style="--darkreader-inline-color: var(--darkreader-text-ffffff, #e8e6e3);" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13v-1h6V6h1v6h6v1h-6v6h-1v-6z"></path></svg>
                        <p class="mt-1 mb-0.5 text-sm">${post.score}</p>
                        <svg class="cursor-pointer text-white hover:text-red-500 transition" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" style=" --darkreader-inline-color: var(--darkreader-text-ffffff, #e8e6e3);" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13v-1h13v1z"></path></svg>
                        
                    </div>

                    <div class="centerPostContainer flex flex-col ml-5 mr-auto">
                        <p class="postNumberId font-mono text-sm text-zinc-500">${postCount}</p>

                        <span class="flex flex-row gap-2 items-center">
                            <p class="postTitle text-lg">${post.title}</p>
                            <a href="${post.url}" class="postSource text-sm text-zinc-500">(${post.url})</a>
                        </span>

                        <span class="flex flex-row text-sm gap-1 text-zinc-400 mb-1.5">     <!-- done trick with many nested <p>'s to make fading effect only on ? chars -->
                            <p class="postAuthor">by <b class="text-(--color-main-orange)">${post.by}</b> ·</p>
                            <p class="postAuthor">???</p><p>pts ·</p>
                            <p class="postAuthor">${postPublishedAgo}</p>
                        </span>

                        <span class="flex flex-row justify-between">
                            <span class="flex flex-row gap-2 items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" style="color: rgb(255, 255, 255); --darkreader-inline-color: var(--darkreader-text-ffffff, #e8e6e3);" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4.586l-2.707 2.707a1 1 0 0 1-1.414 0L8.586 19H4a2 2 0 0 1-2-2zm18 0H4v11h5a1 1 0 0 1 .707.293L12 19.586l2.293-2.293A1 1 0 0 1 15 17h5zM6 9.5a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1m0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1"></path></svg>
                                <p class="commentsQuantity text-sm text-zinc-400">${commentsCount}</p>

                                <p class="commentsQuantity text-sm text-zinc-400">last message in thread: <i>?</i> h ago</p>
                            </span>
                        </span>
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



            for(let i=loadFrom; i<=loadTo; i++) {

                const storyResponse = await fetch(itemUrl(data[i]));
                            
                if(storyResponse.ok) {
                    const storyData = await storyResponse.json();

                    document.getElementById("loading-posts").classList.add("hidden");
                    document.getElementById("loading-posts").classList.remove("flex");

                    // creates posts which has passed - data, number of post(iteration), loadFrom and loadTo
                    const currentPost = await createPost(storyData, i + ".", loadFrom, loadTo);

                    // insert into html
                    document.getElementById("posts").innerHTML += currentPost;
                    
                    // load it into mem
                    tempLocalPostsArr.push(currentPost);

                }
                document.getElementById("posts").classList.remove("hidden");
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