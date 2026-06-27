document.querySelector("#refreshButton").addEventListener("click",async ()=>{
    const refreshArrow = document.querySelector("#refreshArrow");   

    refreshArrow.classList.add("animate-spin");

    const success = await getData();

    setTimeout(() => {
        if(success == true) {
            refreshArrow.classList.remove("animate-spin");
        }
    }, 1000);

});

async function getData() {
    const url = "http://localhost:3000/api/hello";

    try {
        const response = await fetch(url);

        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
            
            return false;
        }
        else {
            const data = await response.json();
            console.log(data.message);

            return true;
        }
    }
    catch(error) {
        console.log(error)
        return false;
    }
}