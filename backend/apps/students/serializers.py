from rest_framework import serializers
from .models import StudentProfile, ParentGuardian, EmergencyContact


class StudentProfileSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'user_details', 'student_id', 'year_of_study', 
                 'major', 'gpa', 'admission_date', 'graduation_date', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'full_name': obj.user.get_full_name(),
            'email': obj.user.email,
            'phone_number': obj.user.phone_number,
        }


class ParentGuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentGuardian
        fields = ['id', 'student', 'name', 'relationship', 'email', 
                 'phone_number', 'address', 'occupation', 'is_primary_contact', 
                 'created_at']
        read_only_fields = ['id', 'created_at']


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['id', 'student', 'name', 'relationship', 'phone_number', 
                 'email', 'address', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']


class StudentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with related data"""
    user_details = serializers.SerializerMethodField()
    parents_guardians = ParentGuardianSerializer(many=True, read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'user_details', 'student_id', 'year_of_study', 
                 'major', 'gpa', 'admission_date', 'graduation_date', 
                 'is_active', 'parents_guardians', 'emergency_contacts',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'full_name': obj.user.get_full_name(),
            'email': obj.user.email,
            'phone_number': obj.user.phone_number,
            'profile_picture': obj.user.profile_picture.url if obj.user.profile_picture else None,
        }
