import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { SecureStorageService } from '../../services/secure-storage.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  user: User = {
    id: 0,
    email: '',
    name: '',
    username: '',
    password: '',
    phone: '',
    createdOn: '',
    roleId: '',
    avatarPath: '',
    publicAvatarId: '',
    isActive: true
  };
  validationForm : FormGroup;
  selectedFile: File | null = null;
  userId : number = -1;
  isLoading = false;  

  constructor(private userService : UserService, private secureStorageService : SecureStorageService, private fb: FormBuilder){
    this.validationForm = this.fb.group({
      username: [
        this.user.username,
        [Validators.required]
      ],
      name: [this.user.name, 
        [Validators.required]
      ],
      email: [this.user.email, [Validators.required, Validators.email]],
      phone: [this.user.phone, 
        [Validators.required,
        Validators.pattern("^([0-9]{10})$|^([0-9]{3}-[0-9]{3}-[0-9]{4})$|^(\\+?[0-9]{1,4}[\\s]?\\(?[0-9]{3}\\)?[\\s]?[0-9]{3}[-\\s]?[0-9]{4})$")]
      ]
    });
  }

  ngOnInit(): void {
      this.getUser();
      this.validationForm.get('username')?.disable();
      this.validationForm.get('email')?.disable();
  }

  getUser(): void{
    if(this.userService.isLoggedIn()){
      this.userId = Number(this.secureStorageService.getUserId());
      this.userService.getUserById(this.userId).subscribe({
        next : (data : User) => {
          if(data){
            this.user = data

            this.validationForm.patchValue({
              username: this.user.username,
              name: this.user.name,
              email: this.user.email,
              phone: this.user.phone
            });
          }
        },
        error : (error) => {
          console.error("Error : "+error);
        }
      })
    }
  }

  onSubmit(): void{
    if (this.validationForm.valid) {
      if(this.validationForm.value['name'].trim() == ""){
        window.alert("Tên không được để trống")
      }else{
        this.isLoading = true;
        this.userService.editUserInfo(this.userId, this.validationForm.value['name'], this.validationForm.value['phone']).subscribe({
          next : (data : {message : string}) => {
            if(data){
              this.isLoading = false;
              window.alert(data.message);
              window.location.reload();
            }
          },
          error : (error) => {
            console.error('Error : '+error);
          }
        })
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];  // Get the selected file
    if (file) {
      this.selectedFile = file;
      this.isLoading = true; 
      console.log('File selected:', file.name);
      this.updateAvatar();
    }
  }

  updateAvatar(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('files', this.selectedFile, this.selectedFile.name);  // Append the file to FormData
      this.userService.changeAvatar(this.userId, formData).subscribe({
        next : (data : {message : string}) => {
          if(data){
            this.isLoading = false;
            window.alert(data.message);
            window.location.reload();
          }
        },
        error : (error) => {
          console.error('Error : '+error);
        }
      });
    }
  }
}
