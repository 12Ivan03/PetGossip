// Code to run when the window has fully loaded

// window.onload = function () {
//   function preloadImages(images, cb) {
//     let loaded = 0;
//     const numImages = images.length;

//     function imageLoaded() {
//       loaded++;
//       if (loaded === numImages) {
//         cb();
//       }
//     }

//     images.forEach(src => {
//       const img = new Image();
//       img.onload = imageLoaded;
//       img.src = src;
//     });
//   }

//   // List of image URLs to preload
//   const imageFolder = 'public/images/';
//   const imageUrls = [
//     'gras.jpeg',
//     'woman-walking-with-her-dog.jpeg',
//     'isolated-on-blue-background.jpeg',
//     'petgossip-logo.png',
//     'petgossip-logo-black-transparent.png',
//     'running-in-grass-dog.jpeg',
//     'petgossip-end-logo-transparent.png',
//     'white-horizontal-website-banner.jpeg'

//   ];

//   preloadImages(imageUrls.map(url => imageFolder + url), function () {
//     console.log('All images preloaded.');
//     // Continue with your website initialization or show content
//   });
// }

document.addEventListener("DOMContentLoaded", () => {

  //// All Pet profile ////
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
    const dinamiName = hover.querySelector('.dinamic-name');

    hover.addEventListener('mouseover', () => {
      hover.style.color = "black";
      hover.style.fontSize = "x-large";
      dinamiName.style.fontSize = "2.5rem";
    });

    hover.addEventListener('mouseleave', () => {
      hover.style.color = "rgb(78, 77, 77)";
      hover.style.fontSize = "larger"
      dinamiName.style.fontSize = "x-large";

    });

  })

  const userBioHover = document.querySelectorAll('.hover-user-bio');

  userBioHover.forEach((hover) => {

    hover.addEventListener('mouseover', () => {
      hover.style.color = "black";
    })

    hover.addEventListener('mouseleave', () => {
      hover.style.color = "rgb(78, 77, 77)";
    })

  })

  //// img pet hover ////

  const hoverImgdiv = document.getElementById('img-div');

  if (hoverImgdiv) {
    hoverImgdiv.addEventListener('mouseover', () => {
      hoverImgdiv.classList.add('bigger-img-hover')
    })

    hoverImgdiv.addEventListener('mouseleave', () => {
      hoverImgdiv.classList.remove('bigger-img-hover')
    })
  }

  const deleteModal = document.querySelector('.delete-modal');
  const deleteButton = document.querySelector('.delete-button');
  const backdrop = document.querySelector('.backdrop');
  const cancelBtn = document.querySelector('.btn-cancel');
  const confirmBtn = document.querySelector('.btn-confirm');

  function closeModal() {
    deleteModal.style.display = 'none';
    backdrop.style.display = 'none';
  }

  if (deleteButton && deleteModal && backdrop && cancelBtn && confirmBtn) {
    deleteButton.addEventListener('click', () => {
      deleteModal.style.display = 'flex';
      backdrop.style.display = 'block';
    })
    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
  }


  // loading Icon //

  const loadingBtn = document.querySelector('.loading-btn')

  if(loadingBtn){
    loadingBtn.addEventListener('click', () => {
      const loadingIcon = document.querySelector('.loading-icon');
      const loadingIconBackground = document.querySelector('.loading-icon-background')
  
      loadingIcon.style.display = 'block';
      loadingIconBackground.style.display = 'block';
    })
  
  }
 
  //snackbar

  let snackbar = document.getElementById("snackbar");
  if (snackbar) {
    snackbar.className = "show";
    setTimeout(function () { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
  }

});