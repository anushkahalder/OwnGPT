import { Component } from '@angular/core';
import { AppserviceService } from '../appservice.service';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {


  //   promptForm!: FormGroup;

  //   response: any;

  //   constructor(private service: AppserviceService,private fb: FormBuilder ) {

  //   }
  //   ngOnInit(): void {
  //     this.promptForm = this.fb.group({
  //     prompt: [''],
  //   });

  // }


  //   processPrompt() {
  //     const promptControl = this.promptForm?.get('prompt');

  //     if (promptControl && promptControl.value) {
  //       console.log(promptControl.value);
  //       const prompt = promptControl.value;
  //     this.service.sendPrompt(prompt).subscribe({
  //       next:(res) =>{
  //         this.response = res
  //         console.log(res);
  //       },
  //       error: (err) => {
  //         console.log(err);
  //         alert('Something Went Wrong.')
  //       }
  //     })
  //   }

  //   }



  // promptForm!: FormGroup;
  // conversations: { question: any, answer: any }[] = [];

  // constructor(private service: AppserviceService, private fb: FormBuilder) { }

  // ngOnInit(): void {
  //   this.promptForm = this.fb.group({
  //     prompt: ['']
  //   });
  // }

  // processPrompt() {
  //   const promptControl = this.promptForm?.get('prompt');

  //   if (promptControl && promptControl.value) {
  //     const question = promptControl.value;
  //     this.service.sendPrompt(question).subscribe({
  //       next: (res: string) => {
  //         console.log(res);
  //         this.conversations.push({ question, answer: res });
  //         promptControl.setValue(''); // Clear input after submission
  //       },
  //       error: (err) => {
  //         console.log(err);
  //         alert('Something went wrong.');
  //       }
  //     });
  //   }
  // }




  promptForm!: FormGroup;
  conversations: any[] = [];
  uploaded: boolean = false;
  selectedFiles: File[] = [];
  response:any;
  constructor(private service: AppserviceService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.promptForm = this.fb.group({
      prompt: ['']
    });
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
    console.log(this.selectedFiles);
  }

  // Assuming this.selectedFiles is an array of File objects containing the selected files

  uploadDocuments() {
    try {
      console.log(this.selectedFiles)
      if (this.selectedFiles.length === 0) {
        throw new Error('Please select at least one file to upload.');
      }

      const formData = new FormData();
      formData.append('documents', this.selectedFiles[0])
      console.log(formData.getAll('documents'));
      // for (let i = 0; i < this.selectedFiles.length; i++) {
      //   formData.append('documents', this.selectedFiles[0], this.selectedFiles[i].name);
      //   console.log(formData)
      // }


      this.service.uploadDocument(formData).subscribe({
        next: (response) => {
          console.log('Documents uploaded successfully:', response);
          this.uploaded = true;
        },
        error: (error) => {
          console.error('Error uploading documents:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }



  formatCode(code:any) {
    // Split the code into lines
    const lines = code.split('\n');
    
    // Initialize an empty array to store the formatted lines
    const formattedLines: any[] = [];
    
    // Iterate over each line of the code
    lines.forEach((line:any) => {
        // Trim leading and trailing whitespace
        line = line.trim();
        
        // Add the trimmed line to the formatted lines array
        formattedLines.push(line);
    });
    
    // Join the formatted lines with newline characters
    return formattedLines.join('\n');
}
  processPrompt() {
    const promptControl = this.promptForm.get('prompt');

    if (promptControl && promptControl.value) {
      const prompt = promptControl.value;
      this.service.sendPrompt(prompt).subscribe({
        next: (res) => {
          console.log("Server response:", res);
          this.response = res;
          
        
          const formattedResponse = this.response.response.toString().replace(/[/*]/g, '');
          console.log(formattedResponse.response);
  
          this.conversations.push({ question: prompt, answer: formattedResponse });
           
          promptControl.setValue(''); // Clear the input field after submission
        },
        error: (err) => {
          console.error("Error processing prompt:", err);
          alert('Something went wrong while processing the prompt.');
        }
      });
    }
  }

}
