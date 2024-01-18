// Code to run when the window has fully loaded
document.addEventListener("DOMContentLoaded",() => {
      
  //// Pet profile ////
    const hoverContainers = document.querySelectorAll('.hover-each-grid-box');
      
  
    hoverContainers.forEach((hoverContainer) => {
      const genreElement = hoverContainer.querySelector('.hover-name');
      const imgOfAnimal = hoverContainer.querySelector('.hover-image');
          
        
      hoverContainer.addEventListener('mouseenter', () => {
          genreElement.style.color = "gray";
          genreElement.style.fontSize = "xx-large";
          imgOfAnimal.style.width = "25rem";
          imgOfAnimal.style.height = "23rem";
      });
        
      hoverContainer.addEventListener('mouseleave', () => {
          genreElement.style.color = 'black';
          genreElement.style.fontSize = "medium";
          imgOfAnimal.style.width = "20rem";
          imgOfAnimal.style.height = "17rem";
      });
    });
  
    //// edit comment ////
  
    const editPlusCommentDiv = document.querySelectorAll('.edit-plus-comment-div');
  
    editPlusCommentDiv.forEach((hoverContainer) => {
      const commentDiv = hoverContainer.querySelector('.comment-div');
      const editBtn = hoverContainer.querySelector('.edit-btn');
          
      editBtn.addEventListener('click', () => {
        commentDiv.style.display = "flex";
        editBtn.style.display = 'none';
      });   
    });


    ////scroll up ////

    // const petOpening = document.querySelector('.pet-opening');

    // const handleScroll = () => {
    //   const scrollY = window.scrollY;

    //   const threshold = 100;

    //   if (scrollY > threshold) {
    //     petOpening.classList.add('fade-away');
    //   } else {
    //     petOpening.classList.remove('fade-away');
    //   }
    // };

    // window.addEventListener('scroll', handleScroll);
  });