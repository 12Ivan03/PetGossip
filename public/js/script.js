// Code to run when the window has fully loaded
document.addEventListener("DOMContentLoaded",() => {
      
//// Pet profile ////
  const hoverContainers = document.querySelectorAll('.hover');
    

  hoverContainers.forEach((hoverContainer) => {
    const genreElement = hoverContainer.querySelector('.hover-name');
    // const imgOfAnimal = document.querySelectorAll('.hover-image');
        
      
    hoverContainer.addEventListener('mouseenter', () => {
        genreElement.style.color = "gray";
        genreElement.style.fontSize = "xx-large";
    });
      
    hoverContainer.addEventListener('mouseleave', () => {
        genreElement.style.color = 'black';
        genreElement.style.fontSize = "medium";
    });
  });

  //// Layout ////

  const iframeMainPage = document.getElementById('pet-profile-page');
  //profilePet
  const iframeBtn = document.getElementById('iframe-edit-message-popup-btn');
  const iframeFrameWindow = document.getElementById('iframe-edit-message-popup-page');
  const ifrmaeSaveMessage = document.getElementById('iframe-edit-message-save-btn');
  //New chile outside of the blur div 
  const newIdeaTested = document.getElementById('new-idea-test');


  iframeBtn.addEventListener('click', () => {
    iframeFrameWindow.style.display = "block";

    iframeFrameWindow.classList.remove('blur-on');
    iframeFrameWindow.classList.add('blur-off');

    iframeMainPage.classList.remove('blur-off');
    iframeMainPage.classList.add('blur-on');

    newIdeaTested.appendChild(iframeFrameWindow);
  });

  ifrmaeSaveMessage.addEventListener('click', () => {
    iframeFrameWindow.style.display = "none";
  
  });

});