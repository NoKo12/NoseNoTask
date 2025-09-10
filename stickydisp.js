function stickydisp() {
            const Stickynote = document.getElementById("Stickynote"); // スタイル元
            const addbutton = document.getElementById("memoAdd"); // スタイル元
            const dispbutton = document.getElementById("stickydisp"); // スタイル元
            const sticDldisp = document.getElementById("stickyDlPointa"); // スタイル元
            Stickynote.classList.toggle("stickDisp");
            addbutton.classList.toggle("addbutton");
            dispbutton.classList.toggle("dispdisp");
            sticDldisp.classList.toggle("disp");       
};
