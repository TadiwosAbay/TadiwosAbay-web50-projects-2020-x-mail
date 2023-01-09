document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#eachEmail').style.display = 'none';
  document.querySelector('#replyview').style.display = 'none';


  document.querySelector('#compose-form').onsubmit= ()=>{
    event.preventDefault();
    const receiver=document.querySelector('#compose-recipients').value;
    const title=document.querySelector('#compose-subject').value;
    const para=document.querySelector('#compose-body').value;
  fetch('/emails',{
    method:'POST',
    body:JSON.stringify({
      recipients:receiver,
      subject:title,
      body:para
    })
  })
    .then(setTimeout(()=>load_mailbox('sent'),1000));


}


document.querySelector('#compose-recipients').value = '';
document.querySelector('#compose-subject').value = '';
document.querySelector('#compose-body').value = '';

}



function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
document.querySelector('#emails-view').style.display = 'block';
document.querySelector('#eachEmail').style.display = 'none';
document.querySelector('#replyview').style.display = 'none';
document.querySelector('#compose-view').style.display = 'none';
document.querySelector('#archive').style.visibility='hidden';
document.querySelector('#reply').style.visibility='hidden';
document.querySelector('#unarchive').style.visibility='hidden';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase()+mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response=>response.json())
  .then(emails=>{
       emails.forEach(email=>{
         const kib=document.createElement('div');
         kib.className='email';
         const Nemail=document.createElement('div');
         Nemail.className='Nemail';
         const sen=document.createElement('div');
         const rec=document.createElement('div');
         const sub=document.createElement('div');
         const body=document.createElement('div');
         const tim=document.createElement('div');
         const ems=document.createElement('div');
         sen.append(`From:${email.sender}`);
         rec.append(`To:${email.recipients}`);
         sub.append(`Subject:${email.subject}`);
         body.append(email.body);
         tim.append(`Timestamp:${email.timestamp}`);
         if (email.read){
           const id=parseInt(email.id);
           console.log(email);
           kib.append(sen,sub,tim);
           document.querySelector('#emails-view').append(kib);
           kib.addEventListener('click',()=>{
             document.querySelector('#emails-view','#compose-view','#replyview').style.display = 'none';
             document.querySelector('#eachEmail').style.display = 'block';
             document.querySelector('#eachEmail').innerHTML='';


             fetch(`/emails/${id}`)
             .then(response=>response.json())
             .then(email=>{
               ems.append(sen,rec,sub,body,tim);
               if(mailbox=== 'inbox' ){
               document.querySelector('#reply').style.visibility='visible';
               document.querySelector('#archive').style.visibility='visible';
               document.querySelector('#reply').addEventListener('click',()=>replying(email));
               document.querySelector('#archive').addEventListener('click',()=>archiving(email));
             }
               document.querySelector('#eachEmail').append(ems);


               if(email.archived){
                 document.querySelector('#unarchive').style.visibility='visible';
                 document.querySelector('#unarchive').addEventListener('click',()=>unarchiving(email));
             }


         })
       });

     }
         else{
           const id=parseInt(email.id);
           console.log(email);
           Nemail.append(sen,sub,tim);
           document.querySelector('#emails-view').append(Nemail);
           Nemail.addEventListener('click',()=>{
             document.querySelector('#emails-view','#compose-view').style.display = 'none';
             document.querySelector('#eachEmail').style.display = 'block';
             document.querySelector('#eachEmail').innerHTML='';
             fetch(`/emails/${id}`)
             .then(response=> response.json())
             .then(email=>{
               ems.append(sen,rec,sub,body,tim);
               
               fetch(`/emails/${id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                  read: true
                  })
                  })
                  if(mailbox=== 'inbox') {
                  document.querySelector('#reply').style.visibility='visible';
                  document.querySelector('#archive').style.visibility='visible';
                  document.querySelector('#reply').addEventListener('click',()=>replying(email));
                  document.querySelector('#archive').addEventListener('click',()=>archiving(email));
                }
                  document.querySelector('#eachEmail').append(ems);

                  if(email.archived){
                   document.querySelector('#unarchive').style.visibility='visible';
                    document.querySelector('#unarchive').addEventListener('click',()=>unarchiving(email));
                }

             })
           });
         }


       })
     })
}
function replying(emai){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#eachEmail').style.display = 'none';
  document.querySelector('#replyview').style.display='block';
  var recipient=`${emai.sender}`;
  var sub=`${emai.subject}`;
  var re='Re:';

  document.querySelector('#recipient').value=`${emai.sender}`;
  if(sub.slice(0,4)=='Re: '){
    document.querySelector('#subject').value=`${sub}`;
  }
  else{
    document.querySelector('#subject').value=re.concat("",sub);
  }
  var body=`On ${emai.timestamp} ${emai.sender} wrote:|
  ${emai.body}|`;
  document.querySelector('#body').value=body;
  document.querySelector('#reply-form').onsubmit= ()=>{
    const para=document.querySelector('#body').value;
    fetch('/emails',{
      method:'POST',
      body:JSON.stringify({
      recipients:recipient,
      subject:sub,
      body:para
    })
  })
  }
}

function archiving(ema){
  event.preventDefault();
  const id=parseInt(ema.id);
  const unarchive=document.querySelector('#unarchive');

  fetch(`/emails/${id}`, {
       method: 'PUT',
       body: JSON.stringify({
       archived: true
       })
       })
      .then(setTimeout(()=>load_mailbox('inbox'),1000));

}

function unarchiving(em){
  event.preventDefault();
  const id=parseInt(em.id);
  fetch(`/emails/${id}`, {
     method: 'PUT',
     body: JSON.stringify({
     archived: false
     })
     })
     .then(setTimeout(()=>load_mailbox('inbox'),1000));

}




});
