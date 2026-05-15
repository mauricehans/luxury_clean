from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_portfolioimagepair'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobapplication',
            name='cv_file',
            field=models.FileField(blank=True, max_length=255, null=True, upload_to='cvs/'),
        ),
    ]
