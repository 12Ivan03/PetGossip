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
  
    editPlusCommentDiv.forEach((editBLurMsg) => {
      const commentDiv = editBLurMsg.querySelector('.comment-div');
      const editBtn = editBLurMsg.querySelector('.edit-btn');
          
      editBtn.addEventListener('click', () => {
        commentDiv.style.display = "flex";
        editBtn.style.display = 'none';
      });   
    });


    ////hover pet info ////

    const hoverPetInfoLi = document.querySelectorAll('.hover-pet-info-li');


    hoverPetInfoLi.forEach((hover) => {
      const dinamiName = hover.querySelector('.dinamic-name')
      

      hover.addEventListener('mouseover', () => {
        hover.style.color ="black";
        hover.style.fontSize = "x-large";
        dinamiName.style.fontSize = "2.5rem";
      });

      hover.addEventListener('mouseleave', () => {
        hover.style.color ="rgb(78, 77, 77)";
        hover.style.fontSize = "larger"
        dinamiName.style.fontSize = "x-large";
      });
      
    })

    //// img pet hover ////

    const hoverImgdiv = document.querySelector('#img-div')

    hoverImgdiv.addEventListener('mouseover', () => {
      hoverImgdiv.classList.add('bigger-img-hover')
    })

    hoverImgdiv.addEventListener('mouseleave', () => {
      hoverImgdiv.classList.remove('bigger-img-hover')
    })


    
  });